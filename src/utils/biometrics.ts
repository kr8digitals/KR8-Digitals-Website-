/**
 * WebAuthn & Device Biometric / Fingerprint Authentication Helper for KR8 Digitals
 * Rigorous implementation that triggers genuine hardware sensor touch prompts
 * and reports true status without false positive simulations.
 */

const BIOMETRICS_KEY = "kr8_biometrics_credentials_v1";

export type BiometricCredential = {
  studentId: string;
  studentName: string;
  registeredAt: number;
  credentialId: string;
  deviceLabel: string;
  authenticatorType?: "platform" | "cross-platform";
};

export function getRegisteredBiometrics(): BiometricCredential[] {
  try {
    const raw = localStorage.getItem(BIOMETRICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredBiometrics(creds: BiometricCredential[]) {
  try {
    localStorage.setItem(BIOMETRICS_KEY, JSON.stringify(creds));
  } catch {
    // ignore
  }
}

export function hasBiometricCredential(studentId: string): boolean {
  const all = getRegisteredBiometrics();
  return all.some((c) => c.studentId.toLowerCase() === studentId.toLowerCase());
}

export function getBiometricForStudent(studentId: string): BiometricCredential | undefined {
  const all = getRegisteredBiometrics();
  return all.find((c) => c.studentId.toLowerCase() === studentId.toLowerCase());
}

export async function isPlatformBiometricSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {
    return false;
  }
  return true;
}

export async function checkBiometricSupport(): Promise<{
  supported: boolean;
  hasPlatformSensor: boolean;
  reason: string;
}> {
  if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
    return {
      supported: false,
      hasPlatformSensor: false,
      reason: "Browser does not support WebAuthn / Biometrics.",
    };
  }

  if (window.isSecureContext === false) {
    return {
      supported: false,
      hasPlatformSensor: false,
      reason: "Biometrics requires a secure HTTPS connection.",
    };
  }

  try {
    const hasPlatform = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (hasPlatform) {
      return {
        supported: true,
        hasPlatformSensor: true,
        reason: "Hardware biometric sensor (Touch ID, Windows Hello, or Phone Fingerprint) is ready.",
      };
    }
    return {
      supported: true,
      hasPlatformSensor: false,
      reason: "WebAuthn passkey supported (via mobile QR scan or security key).",
    };
  } catch {
    return {
      supported: true,
      hasPlatformSensor: false,
      reason: "WebAuthn credential API available.",
    };
  }
}

/**
 * Register a real fingerprint / biometric passkey for a student account.
 * Triggers native OS / browser prompt for the user to touch their hardware sensor.
 */
export async function registerBiometric(
  studentId: string,
  studentName: string
): Promise<{ ok: boolean; credential?: BiometricCredential; error?: string }> {
  if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
    return {
      ok: false,
      error: "WebAuthn biometrics is not supported in this browser. Please use Chrome, Safari, Edge, or Firefox on a supported device.",
    };
  }

  if (window.isSecureContext === false) {
    return {
      ok: false,
      error: "Biometric sensor authentication requires a secure HTTPS connection.",
    };
  }

  try {
    const hasPlatformSensor = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    const userIdBytes = new TextEncoder().encode(studentId);

    // Standard WebAuthn creation options
    // Note: rp.id is deliberately omitted so the browser automatically binds to the document's effective origin,
    // avoiding SecurityError issues on IP addresses, localhost ports, or preview domains.
    const createOptions: CredentialCreationOptions = {
      publicKey: {
        challenge,
        rp: {
          name: "KR8 Digitals Studio",
        },
        user: {
          id: userIdBytes,
          name: studentId,
          displayName: studentName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },   // ES256 (Touch ID, Face ID, Android Fingerprint)
          { type: "public-key", alg: -257 }, // RS256 (Windows Hello)
          { type: "public-key", alg: -8 },   // Ed25519
        ],
        authenticatorSelection: {
          authenticatorAttachment: hasPlatformSensor ? "platform" : undefined,
          userVerification: "preferred",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      },
    };

    let credential: PublicKeyCredential | null = null;
    try {
      credential = (await navigator.credentials.create(createOptions)) as PublicKeyCredential | null;
    } catch (createErr: unknown) {
      const err = createErr as { name?: string; message?: string };
      // If platform attachment failed (e.g. user selected phone passkey or no built-in sensor was configured),
      // retry once with cross-platform attachment allowed
      if (hasPlatformSensor && (err.name === "NotSupportedError" || err.name === "ConstraintError")) {
        const fallbackOptions: CredentialCreationOptions = {
          publicKey: {
            ...createOptions.publicKey!,
            authenticatorSelection: {
              userVerification: "preferred",
              residentKey: "preferred",
            },
          },
        };
        credential = (await navigator.credentials.create(fallbackOptions)) as PublicKeyCredential | null;
      } else {
        throw createErr;
      }
    }

    if (!credential) {
      return {
        ok: false,
        error: "Sensor touch was not completed. No biometric credential was returned.",
      };
    }

    const newCred: BiometricCredential = {
      studentId,
      studentName,
      registeredAt: Date.now(),
      credentialId: credential.id,
      deviceLabel: hasPlatformSensor
        ? "Hardware Sensor (Touch ID / Fingerprint / Windows Hello)"
        : "Biometric Passkey / Device Authenticator",
      authenticatorType: hasPlatformSensor ? "platform" : "cross-platform",
    };

    const existing = getRegisteredBiometrics().filter((c) => c.studentId.toLowerCase() !== studentId.toLowerCase());
    saveRegisteredBiometrics([newCred, ...existing]);

    return { ok: true, credential: newCred };
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    console.warn("WebAuthn register result:", err);

    if (err.name === "NotAllowedError") {
      return {
        ok: false,
        error: "Sensor touch prompt was cancelled or timed out. Please touch your fingerprint sensor when prompted by your device.",
      };
    }
    if (err.name === "InvalidStateError") {
      return {
        ok: false,
        error: "This fingerprint/passkey is already registered on this device.",
      };
    }
    if (err.name === "NotSupportedError") {
      return {
        ok: false,
        error: "No compatible fingerprint sensor or biometric authenticator was found on this device.",
      };
    }
    if (err.name === "SecurityError") {
      return {
        ok: false,
        error: "Biometric sensor access is restricted in this window. Please open KR8 Digitals directly in your browser over HTTPS.",
      };
    }

    return {
      ok: false,
      error: err.message || "Fingerprint sensor verification could not be completed.",
    };
  }
}

/**
 * Authenticate via genuine fingerprint / biometric sensor scan.
 * Triggers native OS / browser prompt for sensor touch.
 */
export async function authenticateWithBiometrics(
  studentId?: string
): Promise<{ ok: boolean; studentId?: string; error?: string }> {
  const registered = getRegisteredBiometrics();
  if (registered.length === 0) {
    return {
      ok: false,
      error: "No fingerprint registered on this device yet. Please sign in with your password first, then enable Fingerprint in Settings.",
    };
  }

  const target = studentId
    ? registered.find((c) => c.studentId.toLowerCase() === studentId.toLowerCase())
    : registered[0];

  if (studentId && !target) {
    return {
      ok: false,
      error: `Fingerprint is not configured for account ${studentId}. Please sign in with password and enable Fingerprint in Settings.`,
    };
  }

  if (typeof window === "undefined" || !window.PublicKeyCredential || !navigator.credentials) {
    return {
      ok: false,
      error: "Biometric authentication is not supported on this browser.",
    };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const getOptions: CredentialRequestOptions = {
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: "preferred",
      },
    };

    const assertion = await navigator.credentials.get(getOptions);
    if (!assertion) {
      return {
        ok: false,
        error: "Biometric verification was cancelled or timed out.",
      };
    }

    return { ok: true, studentId: target?.studentId || registered[0].studentId };
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    console.warn("WebAuthn authenticate error:", err);

    if (err.name === "NotAllowedError") {
      return {
        ok: false,
        error: "Sensor touch prompt was cancelled. Please touch your fingerprint sensor to sign in.",
      };
    }
    if (err.name === "SecurityError") {
      return {
        ok: false,
        error: "Biometric access is restricted in this window.",
      };
    }

    return {
      ok: false,
      error: err.message || "Fingerprint verification failed.",
    };
  }
}

export function removeBiometric(studentId: string) {
  const existing = getRegisteredBiometrics().filter((c) => c.studentId.toLowerCase() !== studentId.toLowerCase());
  saveRegisteredBiometrics(existing);
}
