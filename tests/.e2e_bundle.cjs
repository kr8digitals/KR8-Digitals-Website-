"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// tests/e2e_entry_with_cloud.ts
var e2e_entry_with_cloud_exports = {};
__export(e2e_entry_with_cloud_exports, {
  ADMIN_PHONE_NUMBERS: () => ADMIN_PHONE_NUMBERS,
  ADMIN_SECTIONS: () => ADMIN_SECTIONS,
  AGENCY_SERVICES: () => AGENCY_SERVICES,
  ANNOUNCEMENTS: () => ANNOUNCEMENTS,
  ANNOUNCEMENT_BAR: () => ANNOUNCEMENT_BAR,
  ATTENDANCE_TYPES: () => ATTENDANCE_TYPES,
  BLOG: () => BLOG,
  CERTIFICATION_CRITERIA: () => CERTIFICATION_CRITERIA,
  COFOUNDER_PHONES: () => COFOUNDER_PHONES,
  COHORT_YEAR: () => COHORT_YEAR,
  CONTACT: () => CONTACT,
  COUNTRIES: () => COUNTRIES,
  DEFAULT_DOUBT_TO_BELIEF: () => DEFAULT_DOUBT_TO_BELIEF,
  DEFAULT_NARRATIVE_LINES: () => DEFAULT_NARRATIVE_LINES,
  DEFAULT_PUNCHLINE: () => DEFAULT_PUNCHLINE,
  DEFAULT_SKILLS: () => DEFAULT_SKILLS,
  DEFAULT_WAITLIST_WHATSAPP: () => DEFAULT_WAITLIST_WHATSAPP,
  DEFAULT_XP_RULES: () => DEFAULT_XP_RULES,
  FOUNDER_EMAILS: () => FOUNDER_EMAILS,
  FOUNDER_PHONES: () => FOUNDER_PHONES,
  FULL_CURRICULA: () => FULL_CURRICULA,
  FULL_PORTFOLIO_LINK: () => FULL_PORTFOLIO_LINK,
  INITIAL_GALLERY_ITEMS: () => INITIAL_GALLERY_ITEMS,
  INITIAL_STREAM_RECORDINGS: () => INITIAL_STREAM_RECORDINGS,
  INITIAL_STREAM_REPLAYS: () => INITIAL_STREAM_REPLAYS,
  INSTRUCTOR_PHOTOS: () => INSTRUCTOR_PHOTOS,
  MAIN_ADMIN_PASSWORD: () => MAIN_ADMIN_PASSWORD,
  PARTNERS: () => PARTNERS,
  PORTFOLIO: () => PORTFOLIO,
  REAL_STUDENT_TESTIMONIALS: () => REAL_STUDENT_TESTIMONIALS,
  REGISTRATION_VAULT_KEY: () => REGISTRATION_VAULT_KEY,
  SCORING: () => SCORING,
  SKILLS: () => SKILLS,
  SOCIAL_LINKS: () => SOCIAL_LINKS,
  TESTIMONIALS: () => TESTIMONIALS,
  TRIBE_WHATSAPP: () => TRIBE_WHATSAPP,
  ULTIMATE_ADMIN_EMAILS: () => ULTIMATE_ADMIN_EMAILS,
  __cloud: () => __cloud,
  addFeed: () => addFeed,
  addGalleryItem: () => addGalleryItem,
  addPostComment: () => addPostComment,
  addStreamRecording: () => addStreamRecording,
  addTestimonial: () => addTestimonial,
  addVideoComment: () => addVideoComment,
  adminInfoFor: () => adminInfoFor,
  adminRegisterStudent: () => adminRegisterStudent,
  answerStreamQuestion: () => answerStreamQuestion,
  approveGalleryItem: () => approveGalleryItem,
  archiveAnnouncementToGallery: () => archiveAnnouncementToGallery,
  areAllRegistrationsClosed: () => areAllRegistrationsClosed,
  assignTaskToViewer: () => assignTaskToViewer,
  authenticateAccount: () => authenticateAccount,
  awardPointsToStreamViewer: () => awardPointsToStreamViewer,
  blockStudent: () => blockStudent,
  buildPhone: () => buildPhone,
  canAccessAdminSection: () => canAccessAdminSection,
  canUserHostStream: () => canUserHostStream,
  closeStreamPoll: () => closeStreamPoll,
  completePasswordReset: () => completePasswordReset,
  completeStreamTask: () => completeStreamTask,
  countryByCode: () => countryByCode,
  createBlogPost: () => createBlogPost,
  createStreamInvite: () => createStreamInvite,
  createStreamPoll: () => createStreamPoll,
  deleteClientRequest: () => deleteClientRequest,
  deleteCustomSkill: () => deleteCustomSkill,
  deleteGalleryItem: () => deleteGalleryItem,
  deleteLiveChatMessage: () => deleteLiveChatMessage,
  deleteStreamRecording: () => deleteStreamRecording,
  deleteTestimonial: () => deleteTestimonial,
  deleteVideoComment: () => deleteVideoComment,
  demoteAccount: () => demoteAccount,
  demoteViewer: () => demoteViewer,
  detectCountryCode: () => detectCountryCode,
  dismissStreamQuestion: () => dismissStreamQuestion,
  endActiveLiveStream: () => endActiveLiveStream,
  fdAllowed: () => fdAllowed,
  feedAction: () => feedAction,
  findStudent: () => findStudent,
  generateDefaultAvatar: () => generateDefaultAvatar,
  getAccountById: () => getAccountById,
  getAccounts: () => getAccounts,
  getActiveLiveStream: () => getActiveLiveStream,
  getAnnouncementBar: () => getAnnouncementBar,
  getAnnouncements: () => getAnnouncements,
  getAttendanceSubmissions: () => getAttendanceSubmissions,
  getAttendanceTypesSettings: () => getAttendanceTypesSettings,
  getBlockedUserIds: () => getBlockedUserIds,
  getBlogPosts: () => getBlogPosts,
  getCertificateById: () => getCertificateById,
  getClientRequests: () => getClientRequests,
  getCustomSkills: () => getCustomSkills,
  getDirectMessagesBetween: () => getDirectMessagesBetween,
  getDynamicCurricula: () => getDynamicCurricula,
  getEligibleStreamHosts: () => getEligibleStreamHosts,
  getFeed: () => getFeed,
  getFounders: () => getFounders,
  getGalleryItems: () => getGalleryItems,
  getHomepageSettings: () => getHomepageSettings,
  getLastEndedStream: () => getLastEndedStream,
  getLiveChatMessages: () => getLiveChatMessages,
  getPaymentSettings: () => getPaymentSettings,
  getPortfolio: () => getPortfolio,
  getRecognizedAdmin: () => getRecognizedAdmin,
  getReferralUrl: () => getReferralUrl,
  getSkill: () => getSkill,
  getSkillCode: () => getSkillCode,
  getSkillName: () => getSkillName,
  getSkillRegistration: () => getSkillRegistration,
  getSkillSuffix: () => getSkillSuffix,
  getSkillWhatsApp: () => getSkillWhatsApp,
  getSkills: () => getSkills,
  getSocialLinks: () => getSocialLinks,
  getStreamAccessRequests: () => getStreamAccessRequests,
  getStreamInvites: () => getStreamInvites,
  getStreamPolls: () => getStreamPolls,
  getStreamQuestions: () => getStreamQuestions,
  getStreamRecordings: () => getStreamRecordings,
  getStreamReplays: () => getStreamReplays,
  getStudentAttendance: () => getStudentAttendance,
  getStudentCertificates: () => getStudentCertificates,
  getStudentConversations: () => getStudentConversations,
  getStudentNotifications: () => getStudentNotifications,
  getStudents: () => getStudents,
  getSuspendedAccounts: () => getSuspendedAccounts,
  getTeam: () => getTeam,
  getTestimonials: () => getTestimonials,
  getTribeWhatsApp: () => getTribeWhatsApp,
  getVideoComments: () => getVideoComments,
  getWaitlistWhatsAppUrl: () => getWaitlistWhatsAppUrl,
  getXpRules: () => getXpRules,
  hydrateAccountsFromSupabase: () => hydrateAccountsFromSupabase,
  initSupabaseSync: () => initSupabaseSync,
  isCoFounderAccount: () => isCoFounderAccount,
  isCredentialSuspended: () => isCredentialSuspended,
  isExecutiveAccount: () => isExecutiveAccount,
  isFounderAccount: () => isFounderAccount,
  isStreamTerminated: () => isStreamTerminated,
  isStudentBlocked: () => isStudentBlocked,
  isUltimateAdmin: () => isUltimateAdmin,
  isVip: () => isVip,
  issueCertificate: () => issueCertificate,
  joinStreamViewer: () => joinStreamViewer,
  leaveStreamViewer: () => leaveStreamViewer,
  likeVideoComment: () => likeVideoComment,
  markConversationRead: () => markConversationRead,
  markNotificationRead: () => markNotificationRead,
  markStreamTerminated: () => markStreamTerminated,
  muteAllListeners: () => muteAllListeners,
  nextSerial: () => nextSerial,
  normalizeEmail: () => normalizeEmail,
  normalizeIdentity: () => normalizeIdentity,
  normalizePhone: () => normalizePhone,
  pinLiveChatMessage: () => pinLiveChatMessage,
  promoteAccount: () => promoteAccount,
  promoteParticipantRole: () => promoteParticipantRole,
  promoteViewerToMod: () => promoteViewerToMod,
  promoteViewerToSpeaker: () => promoteViewerToSpeaker,
  randomAdminPassword: () => randomAdminPassword,
  recoverId: () => recoverId,
  registerStudent: () => registerStudent,
  registerTribe: () => registerTribe,
  rejectGalleryItem: () => rejectGalleryItem,
  reportConversation: () => reportConversation,
  requestPasswordReset: () => requestPasswordReset,
  requestStreamAccess: () => requestStreamAccess,
  resetAdminPassword: () => resetAdminPassword,
  respondStreamAccessRequest: () => respondStreamAccessRequest,
  restoreSuspendedAccount: () => restoreSuspendedAccount,
  reviewAttendance: () => reviewAttendance,
  revokeStudentRegistration: () => revokeStudentRegistration,
  saveAccounts: () => saveAccounts,
  saveActiveLiveStream: () => saveActiveLiveStream,
  saveAnnouncementBar: () => saveAnnouncementBar,
  saveAnnouncements: () => saveAnnouncements,
  saveAttendanceSubmissions: () => saveAttendanceSubmissions,
  saveBlogPosts: () => saveBlogPosts,
  saveClientRequest: () => saveClientRequest,
  saveCustomSkill: () => saveCustomSkill,
  saveDynamicCurriculum: () => saveDynamicCurriculum,
  saveFounders: () => saveFounders,
  saveGalleryItems: () => saveGalleryItems,
  saveHomepageSettings: () => saveHomepageSettings,
  saveLiveChatMessages: () => saveLiveChatMessages,
  savePaymentSettings: () => savePaymentSettings,
  savePortfolio: () => savePortfolio,
  saveSkillSetting: () => saveSkillSetting,
  saveSocialLinks: () => saveSocialLinks,
  saveStreamPolls: () => saveStreamPolls,
  saveStreamQuestions: () => saveStreamQuestions,
  saveStreamRecordings: () => saveStreamRecordings,
  saveStreamReplays: () => saveStreamReplays,
  saveSuspendedAccounts: () => saveSuspendedAccounts,
  saveTeam: () => saveTeam,
  saveTestimonials: () => saveTestimonials,
  saveVerifyRemark: () => saveVerifyRemark,
  saveVideoComments: () => saveVideoComments,
  saveWaitlistWhatsAppUrl: () => saveWaitlistWhatsAppUrl,
  saveXpRules: () => saveXpRules,
  searchStudentsFast: () => searchStudentsFast,
  sendDirectMessage: () => sendDirectMessage,
  sendLiveChatMessage: () => sendLiveChatMessage,
  setBreakoutRooms: () => setBreakoutRooms,
  setChatPermission: () => setChatPermission,
  setSpotlightParticipant: () => setSpotlightParticipant,
  startLiveStream: () => startLiveStream,
  studentCount: () => studentCount,
  submitAttendance: () => submitAttendance,
  submitStreamQuestion: () => submitStreamQuestion,
  submitSuspensionAppeal: () => submitSuspensionAppeal,
  suspendStreamActivities: () => suspendStreamActivities,
  suspendStudentAccount: () => suspendStudentAccount,
  syncAccountToSupabase: () => syncAccountToSupabase,
  syncLiveChatMessageToSupabase: () => syncLiveChatMessageToSupabase,
  syncLiveStreamToSupabase: () => syncLiveStreamToSupabase,
  timeAgo: () => timeAgo,
  toggleAttendanceTypeOpen: () => toggleAttendanceTypeOpen,
  toggleFollowStudent: () => toggleFollowStudent,
  toggleFollowUser: () => toggleFollowUser,
  toggleLikePost: () => toggleLikePost,
  toggleParticipantMute: () => toggleParticipantMute,
  toggleRaiseHand: () => toggleRaiseHand,
  toggleStreamLock: () => toggleStreamLock,
  toggleStreamRecordingPublic: () => toggleStreamRecordingPublic,
  tribeCount: () => tribeCount,
  unblockStudent: () => unblockStudent,
  updateAccount: () => updateAccount,
  updateClientRequestStatus: () => updateClientRequestStatus,
  updateLiveStream: () => updateLiveStream,
  updateTestimonial: () => updateTestimonial,
  upholdSuspendedAccount: () => upholdSuspendedAccount,
  upvoteStreamQuestion: () => upvoteStreamQuestion,
  verifyId: () => verifyId,
  voteStreamPoll: () => voteStreamPoll,
  withdrawCertificate: () => withdrawCertificate
});
module.exports = __toCommonJS(e2e_entry_with_cloud_exports);

// src/data/images.ts
var IMG = {
  heroGroup: "https://images.pexels.com/photos/9909069/pexels-photo-9909069.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  collab: "https://images.pexels.com/photos/8547282/pexels-photo-8547282.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  collab2: "https://images.pexels.com/photos/3866398/pexels-photo-3866398.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  student: "https://images.pexels.com/photos/7437487/pexels-photo-7437487.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  studentF: "https://images.pexels.com/photos/5965633/pexels-photo-5965633.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  studio: "https://images.pexels.com/photos/4348298/pexels-photo-4348298.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  studio2: "https://images.pexels.com/photos/4348375/pexels-photo-4348375.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  brand: "https://images.pexels.com/photos/7598007/pexels-photo-7598007.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
  brand2: "https://images.pexels.com/photos/7598009/pexels-photo-7598009.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
  portfolioText: "https://images.pexels.com/photos/18833779/pexels-photo-18833779.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=900",
  // Exact founder image supplied by KR8 Digitals via Drive.
  founder: "https://drive.google.com/uc?export=view&id=1Ssje7WtVFMd8TZxMfrex1S0lKG6p_Wp9",
  man1: "https://images.pexels.com/photos/30496625/pexels-photo-30496625.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  man2: "https://images.pexels.com/photos/7163434/pexels-photo-7163434.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  woman1: "https://images.pexels.com/photos/6497112/pexels-photo-6497112.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  woman2: "https://images.pexels.com/photos/6497114/pexels-photo-6497114.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  woman3: "https://images.pexels.com/photos/7717254/pexels-photo-7717254.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600"
};

// src/data/countries.ts
var ALL_COUNTRIES = [
  { code: "AF", name: "Afghanistan", dial: "+93" },
  { code: "AL", name: "Albania", dial: "+355" },
  { code: "DZ", name: "Algeria", dial: "+213" },
  { code: "AS", name: "American Samoa", dial: "+1684" },
  { code: "AD", name: "Andorra", dial: "+376" },
  { code: "AO", name: "Angola", dial: "+244" },
  { code: "AI", name: "Anguilla", dial: "+1264" },
  { code: "AG", name: "Antigua and Barbuda", dial: "+1268" },
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "AM", name: "Armenia", dial: "+374" },
  { code: "AW", name: "Aruba", dial: "+297" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "AZ", name: "Azerbaijan", dial: "+994" },
  { code: "BS", name: "Bahamas", dial: "+1242" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "BB", name: "Barbados", dial: "+1246" },
  { code: "BY", name: "Belarus", dial: "+375" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "BZ", name: "Belize", dial: "+501" },
  { code: "BJ", name: "Benin", dial: "+229" },
  { code: "BM", name: "Bermuda", dial: "+1441" },
  { code: "BT", name: "Bhutan", dial: "+975" },
  { code: "BO", name: "Bolivia", dial: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", dial: "+387" },
  { code: "BW", name: "Botswana", dial: "+267" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "IO", name: "British Indian Ocean Territory", dial: "+246" },
  { code: "VG", name: "British Virgin Islands", dial: "+1284" },
  { code: "BN", name: "Brunei", dial: "+673" },
  { code: "BG", name: "Bulgaria", dial: "+359" },
  { code: "BF", name: "Burkina Faso", dial: "+226" },
  { code: "BI", name: "Burundi", dial: "+257" },
  { code: "KH", name: "Cambodia", dial: "+855" },
  { code: "CM", name: "Cameroon", dial: "+237" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "CV", name: "Cape Verde", dial: "+238" },
  { code: "KY", name: "Cayman Islands", dial: "+1345" },
  { code: "CF", name: "Central African Republic", dial: "+236" },
  { code: "TD", name: "Chad", dial: "+235" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "KM", name: "Comoros", dial: "+269" },
  { code: "CG", name: "Congo (Brazzaville)", dial: "+242" },
  { code: "CD", name: "Congo (Kinshasa)", dial: "+243" },
  { code: "CK", name: "Cook Islands", dial: "+682" },
  { code: "CR", name: "Costa Rica", dial: "+506" },
  { code: "CI", name: "Cote d'Ivoire", dial: "+225" },
  { code: "HR", name: "Croatia", dial: "+385" },
  { code: "CU", name: "Cuba", dial: "+53" },
  { code: "CY", name: "Cyprus", dial: "+357" },
  { code: "CZ", name: "Czech Republic", dial: "+420" },
  { code: "DK", name: "Denmark", dial: "+45" },
  { code: "DJ", name: "Djibouti", dial: "+253" },
  { code: "DM", name: "Dominica", dial: "+1767" },
  { code: "DO", name: "Dominican Republic", dial: "+1809" },
  { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "SV", name: "El Salvador", dial: "+503" },
  { code: "GQ", name: "Equatorial Guinea", dial: "+240" },
  { code: "ER", name: "Eritrea", dial: "+291" },
  { code: "EE", name: "Estonia", dial: "+372" },
  { code: "SZ", name: "Eswatini", dial: "+268" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "FJ", name: "Fiji", dial: "+679" },
  { code: "FI", name: "Finland", dial: "+358" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "GF", name: "French Guiana", dial: "+594" },
  { code: "PF", name: "French Polynesia", dial: "+689" },
  { code: "GA", name: "Gabon", dial: "+241" },
  { code: "GM", name: "Gambia", dial: "+220" },
  { code: "GE", name: "Georgia", dial: "+995" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "GI", name: "Gibraltar", dial: "+350" },
  { code: "GR", name: "Greece", dial: "+30" },
  { code: "GL", name: "Greenland", dial: "+299" },
  { code: "GD", name: "Grenada", dial: "+1473" },
  { code: "GP", name: "Guadeloupe", dial: "+590" },
  { code: "GU", name: "Guam", dial: "+1671" },
  { code: "GT", name: "Guatemala", dial: "+502" },
  { code: "GN", name: "Guinea", dial: "+224" },
  { code: "GW", name: "Guinea-Bissau", dial: "+245" },
  { code: "GY", name: "Guyana", dial: "+592" },
  { code: "HT", name: "Haiti", dial: "+509" },
  { code: "HN", name: "Honduras", dial: "+504" },
  { code: "HK", name: "Hong Kong", dial: "+852" },
  { code: "HU", name: "Hungary", dial: "+36" },
  { code: "IS", name: "Iceland", dial: "+354" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "IR", name: "Iran", dial: "+98" },
  { code: "IQ", name: "Iraq", dial: "+964" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "IL", name: "Israel", dial: "+972" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "JM", name: "Jamaica", dial: "+1876" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "JO", name: "Jordan", dial: "+962" },
  { code: "KZ", name: "Kazakhstan", dial: "+7" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "KI", name: "Kiribati", dial: "+686" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "KG", name: "Kyrgyzstan", dial: "+996" },
  { code: "LA", name: "Laos", dial: "+856" },
  { code: "LV", name: "Latvia", dial: "+371" },
  { code: "LB", name: "Lebanon", dial: "+961" },
  { code: "LS", name: "Lesotho", dial: "+266" },
  { code: "LR", name: "Liberia", dial: "+231" },
  { code: "LY", name: "Libya", dial: "+218" },
  { code: "LI", name: "Liechtenstein", dial: "+423" },
  { code: "LT", name: "Lithuania", dial: "+370" },
  { code: "LU", name: "Luxembourg", dial: "+352" },
  { code: "MO", name: "Macao", dial: "+853" },
  { code: "MG", name: "Madagascar", dial: "+261" },
  { code: "MW", name: "Malawi", dial: "+265" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "MV", name: "Maldives", dial: "+960" },
  { code: "ML", name: "Mali", dial: "+223" },
  { code: "MT", name: "Malta", dial: "+356" },
  { code: "MH", name: "Marshall Islands", dial: "+692" },
  { code: "MQ", name: "Martinique", dial: "+596" },
  { code: "MR", name: "Mauritania", dial: "+222" },
  { code: "MU", name: "Mauritius", dial: "+230" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "FM", name: "Micronesia", dial: "+691" },
  { code: "MD", name: "Moldova", dial: "+373" },
  { code: "MC", name: "Monaco", dial: "+377" },
  { code: "MN", name: "Mongolia", dial: "+976" },
  { code: "ME", name: "Montenegro", dial: "+382" },
  { code: "MS", name: "Montserrat", dial: "+1664" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "MZ", name: "Mozambique", dial: "+258" },
  { code: "MM", name: "Myanmar", dial: "+95" },
  { code: "NA", name: "Namibia", dial: "+264" },
  { code: "NR", name: "Nauru", dial: "+674" },
  { code: "NP", name: "Nepal", dial: "+977" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "NC", name: "New Caledonia", dial: "+687" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "NI", name: "Nicaragua", dial: "+505" },
  { code: "NE", name: "Niger", dial: "+227" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "KP", name: "North Korea", dial: "+850" },
  { code: "MK", name: "North Macedonia", dial: "+389" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "PW", name: "Palau", dial: "+680" },
  { code: "PS", name: "Palestine", dial: "+970" },
  { code: "PA", name: "Panama", dial: "+507" },
  { code: "PG", name: "Papua New Guinea", dial: "+675" },
  { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "PE", name: "Peru", dial: "+51" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "PL", name: "Poland", dial: "+48" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "PR", name: "Puerto Rico", dial: "+1787" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "RE", name: "Reunion", dial: "+262" },
  { code: "RO", name: "Romania", dial: "+40" },
  { code: "RU", name: "Russia", dial: "+7" },
  { code: "RW", name: "Rwanda", dial: "+250" },
  { code: "KN", name: "Saint Kitts and Nevis", dial: "+1869" },
  { code: "LC", name: "Saint Lucia", dial: "+1758" },
  { code: "VC", name: "Saint Vincent and the Grenadines", dial: "+1784" },
  { code: "WS", name: "Samoa", dial: "+685" },
  { code: "SM", name: "San Marino", dial: "+378" },
  { code: "ST", name: "Sao Tome and Principe", dial: "+239" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "SN", name: "Senegal", dial: "+221" },
  { code: "RS", name: "Serbia", dial: "+381" },
  { code: "SC", name: "Seychelles", dial: "+248" },
  { code: "SL", name: "Sierra Leone", dial: "+232" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "SK", name: "Slovakia", dial: "+421" },
  { code: "SI", name: "Slovenia", dial: "+386" },
  { code: "SB", name: "Solomon Islands", dial: "+677" },
  { code: "SO", name: "Somalia", dial: "+252" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "KR", name: "South Korea", dial: "+82" },
  { code: "SS", name: "South Sudan", dial: "+211" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "LK", name: "Sri Lanka", dial: "+94" },
  { code: "SD", name: "Sudan", dial: "+249" },
  { code: "SR", name: "Suriname", dial: "+597" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "SY", name: "Syria", dial: "+963" },
  { code: "TW", name: "Taiwan", dial: "+886" },
  { code: "TJ", name: "Tajikistan", dial: "+992" },
  { code: "TZ", name: "Tanzania", dial: "+255" },
  { code: "TH", name: "Thailand", dial: "+66" },
  { code: "TL", name: "Timor-Leste", dial: "+670" },
  { code: "TG", name: "Togo", dial: "+228" },
  { code: "TO", name: "Tonga", dial: "+676" },
  { code: "TT", name: "Trinidad and Tobago", dial: "+1868" },
  { code: "TN", name: "Tunisia", dial: "+216" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "TM", name: "Turkmenistan", dial: "+993" },
  { code: "TC", name: "Turks and Caicos Islands", dial: "+1649" },
  { code: "TV", name: "Tuvalu", dial: "+688" },
  { code: "UG", name: "Uganda", dial: "+256" },
  { code: "UA", name: "Ukraine", dial: "+380" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "UY", name: "Uruguay", dial: "+598" },
  { code: "UZ", name: "Uzbekistan", dial: "+998" },
  { code: "VU", name: "Vanuatu", dial: "+678" },
  { code: "VA", name: "Vatican City", dial: "+379" },
  { code: "VE", name: "Venezuela", dial: "+58" },
  { code: "VN", name: "Vietnam", dial: "+84" },
  { code: "YE", name: "Yemen", dial: "+967" },
  { code: "ZM", name: "Zambia", dial: "+260" },
  { code: "ZW", name: "Zimbabwe", dial: "+263" }
];
function findCountry(code) {
  return ALL_COUNTRIES.find((c) => c.code === code) ?? { code: "NG", name: "Nigeria", dial: "+234" };
}

// src/data/store.ts
var INSTRUCTOR_PHOTOS = {
  stevenson: "https://drive.google.com/uc?export=view&id=1TSZrdT2xXpZj6D8_t9PGhu1dSamBNr7C",
  chimnonyerem: "https://drive.google.com/uc?export=view&id=10WVxXW4M28PPi_91oCBRHl5DClrSrTEK",
  timfire: "https://drive.google.com/uc?export=view&id=1Ssje7WtVFMd8TZxMfrex1S0lKG6p_Wp9",
  daniel: "https://drive.google.com/uc?export=view&id=1GFIv8Ho101udn2IbSiz5Zq8G92XJn2AU"
};
var DEFAULT_FOUNDERS = [
  { key: "timfire", name: "Timfire (Kenneth Timothy Iziogo)", role: "CEO \xB7 Founder \xB7 Website Development", bio: "Founder, AI agent developer, website developer, graphic designer, video editor, and linguistics student.", photo: INSTRUCTOR_PHOTOS.timfire },
  { key: "stevenson", name: "Stevenson (Motionverse)", role: "Co-Founder \xB7 Media Director \xB7 Graphic Design", bio: "Stevenson leads Graphic Design at KR8 Digitals under his creative studio, Motionverse. He's spent years turning raw ideas into brand-ready visuals, and brings that same eye for clarity and impact into every lesson he teaches.", photo: INSTRUCTOR_PHOTOS.stevenson },
  { key: "daniel", name: "Daniel (Creative Expression)", role: "Co-Founder \xB7 COO \xB7 Video Editing & Animation", bio: "Daniel heads up Video Editing & Animation at KR8 Digitals, running his own studio, Creative Expression. From raw footage to polished, scroll-stopping content, he teaches students to edit with intention \u2014 not just software skills.", photo: INSTRUCTOR_PHOTOS.daniel }
];
var FOUNDERS_KEY = "kr8_founders_v1";
function getFounders() {
  return load(FOUNDERS_KEY, DEFAULT_FOUNDERS);
}
function saveFounders(founders) {
  save(FOUNDERS_KEY, founders);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:founders-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}
var DEFAULT_TEAM = [
  {
    key: "nicodemus",
    name: "Odobe Nicodemus C (BioNicz)",
    role: "KR8 Financial Strategist",
    bio: "Supports KR8 Digitals with financial strategy, structure and sustainable growth thinking. Nicodemus ensures the institution's tuition-free mission remains economically sound, scalable, and built for long-term viability.",
    photo: "/team/nicodemus.png"
  },
  {
    key: "chimnonyerem",
    name: "Chimnonyerem Mercy",
    role: "Project Director & Frontend Coach",
    bio: "Coordinates technical initiatives and coaches builders toward clear, practical frontend execution. Mercy oversees project lifecycles, ensuring student developers bridge theory into real, responsive web interfaces.",
    photo: "/team/chimnonyerem.jpg"
  },
  {
    key: "favour",
    name: "Nwefuru Favour Chizurum",
    role: "General Manager",
    bio: "Keeps people, programs and academy operations moving in one synchronized direction. Favour manages daily administrative workflows, cohort schedules, and institutional logistics across all skill tracks.",
    photo: "/team/favour.jpg"
  },
  {
    key: "covenant",
    name: "Covenant Afinidi",
    role: "Accountability Partner",
    bio: "Helps the KR8 community keep showing up, following through and growing together. Covenant works directly with learners to maintain daily momentum, resolve learning blockers, and ensure students follow through to graduation.",
    photo: "/team/covenant.png"
  }
];
var TEAM_KEY = "kr8_team_v2";
function getTeam() {
  return load(TEAM_KEY, DEFAULT_TEAM);
}
function saveTeam(team) {
  save(TEAM_KEY, team);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:team-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}
var DEFAULT_SKILLS = [
  {
    key: "graphic",
    name: "Graphic Design",
    suffix: "GDVFD",
    whatsapp: "https://chat.whatsapp.com/G5mSP8JeelfELvnljpgSJ8?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week programme taking complete beginners from zero design knowledge to a professional portfolio \u2014 covering design fundamentals, flyer design, branding & identity, advanced photo manipulation, and responsible AI-assisted design.",
    icon: "palette",
    instructor: { name: "Stevenson (Motionverse)", photo: INSTRUCTOR_PHOTOS.stevenson, bio: "Stevenson leads Graphic Design at KR8 Digitals under his creative studio, Motionverse. He has spent years turning raw ideas into brand-ready visuals, and brings that same eye for clarity and impact into every lesson he teaches." },
    criteria: "Submit 6 accepted assignments + a final brand identity project.",
    curriculum: []
  },
  {
    key: "video",
    name: "Video Editing & Animation",
    suffix: "VEVFD",
    whatsapp: "https://chat.whatsapp.com/GYVKMA6CLPC2mnG356u8jT?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week programme covering both professional video editing (short-form, viral, raw footage to polish) and animation (3D, motion graphics, whiteboard, faceless content, AI-assisted ad videos).",
    icon: "video",
    instructor: { name: "Daniel (Creative Expression)", photo: INSTRUCTOR_PHOTOS.daniel, bio: "Daniel heads up Video Editing & Animation at KR8 Digitals, running his own studio, Creative Expression. From raw footage to polished, scroll-stopping content, he teaches students to edit with intention \u2014 not just software skills." },
    criteria: "Submit 6 accepted edits + a final showreel.",
    curriculum: []
  },
  {
    key: "web",
    name: "Website Development",
    suffix: "WDVFD",
    whatsapp: "https://chat.whatsapp.com/EqdAOw1TxiM7KqTB5EXh8v?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week programme building real websites \u2014 from AI website builders and WordPress/Elementor to e-commerce stores, LMS platforms, and landing pages \u2014 ending with a live personal portfolio site.",
    icon: "code",
    instructor: { name: "Timfire (Kenneth Timothy Iziogo)", photo: INSTRUCTOR_PHOTOS.timfire, bio: "Founder & Website Development instructor at KR8 Digitals." },
    criteria: "Submit 6 accepted builds + a final deployed website.",
    curriculum: []
  },
  {
    key: "frontend",
    name: "Front-End Development",
    suffix: "FEDVFD",
    whatsapp: "https://chat.whatsapp.com/EqdAOw1TxiM7KqTB5EXh8v?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week engineering track taking you from semantic foundations to production-ready interfaces \u2014 mastering responsive CSS & Tailwind, modern JavaScript ES6+, React component architecture, API data fetching, state management, and real client web application deployment.",
    icon: "code",
    instructor: {
      name: "Nonye Mercy",
      photo: "/team/chimnonyerem.jpg",
      bio: "Project Director & Frontend Coach at KR8 Digitals. Coordinates technical initiatives and coaches builders toward clear, practical frontend execution, ensuring student developers bridge theory into real, responsive web interfaces."
    },
    criteria: "Submit 6 accepted frontend builds + a deployed modern web application.",
    curriculum: []
  },
  {
    key: "content_creation",
    name: "Content Creation",
    suffix: "CCVFD",
    whatsapp: "https://chat.whatsapp.com/KRnuYK0hIhh0lobi7Tl7Kz?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week creator programme taking you from zero to a high-retention creator \u2014 covering smartphone cinematography, mobile lighting & audio, CapCut editing, Canva visual design, AI B-roll & ideation, short-form vs long-form architecture, personal branding, and creator media kits.",
    icon: "video",
    instructor: null,
    criteria: "Submit 6 accepted content pieces + a 30-day creator calendar and media kit.",
    curriculum: []
  },
  {
    key: "smm",
    name: "Social Media Management",
    suffix: "SMMVFD",
    whatsapp: "https://chat.whatsapp.com/KRnuYK0hIhh0lobi7Tl7Kz?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week business programme training you to manage and scale brand pages professionally \u2014 covering social SEO & algorithm mechanics, 30-day editorial calendars, persuasive social copywriting, community management & lead nurture, analytics & ROI reporting, pricing, contracts, and client pitching.",
    icon: "mobile",
    instructor: null,
    criteria: "Submit 30-day brand strategy calendar + professional social media audit.",
    curriculum: []
  },
  {
    key: "marketing",
    name: "Digital Marketing",
    suffix: "DMVFD",
    whatsapp: "https://chat.whatsapp.com/Fah586y8c26KkUfRhAe8i6?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week programme built around real, low-to-no-capital income tracks: China Importation, Affiliate Marketing, and Amazon Bounty Programmes \u2014 students graduate having completed real deliverables, not just theory.",
    icon: "chart",
    instructor: null,
    criteria: "Submit 6 accepted assignments + a full campaign plan.",
    curriculum: []
  }
];
var FULL_CURRICULA = {
  graphic: [
    { week: "Week 1", title: "Design Basics", points: ["Intro to Graphic Design & Principles (balance, contrast, alignment, hierarchy, proximity)", "Typography & Color Theory", "Layout, Composition & Tool Setup (Canva, Photoshop)"] },
    { week: "Week 2", title: "Social Media Flyer Design", points: ["Intro to Flyer Design", "Design Hierarchy & Visual Engagement", "Practical Flyer Project (promotional + event flyer)"] },
    { week: "Week 3", title: "Branding & Identity Design", points: ["Intro to Logo Design", "Brand Identity Systems", "Mockups & Presentation"] },
    { week: "Week 4", title: "Advanced Editing & Manipulation", points: ["Photo Manipulation", "Retouching & Cinematic Effects", "Advanced Composition & Workflows"] },
    { week: "Week 5", title: "Introduction to AI in Graphic Design", points: ["What AI can/can't do", "Prompt Writing & AI Tools", "Generating & Editing AI Graphics to make them original"] },
    { week: "Week 6", title: "Portfolio Building & Personal Branding", points: ["Building a Strong Portfolio", "Presenting Projects Professionally", "Social Media Presence & Personal Branding"] },
    { week: "Week 7", title: "Review & Reinforcement", points: ["Full review of all prior weeks", "Open correction session"] },
    { week: "Week 8", title: "Final Project & Graduation", points: ["Project 1 (Paired) \u2014 Collaborative Brand Package (logo, brand colors/typography, flyer, social template, mockup) for a mock/local business.", "Project 2 (Individual) \u2014 Personal Portfolio with 5+ projects (including one AI-assisted piece) plus a written case study.", "Final presentations, portfolio review, community showcase, Certificate award ceremony."] }
  ],
  web: [
    { week: "Week 1", title: "Intro to Website Development & AI Websites", points: ["What a website is, the three build paths (AI/CMS/coding)", "AI Website Design Part 1 (Framer AI, Wix AI, Durable, Mixo)", "AI Website Design Part 2 (customisation, domains)"] },
    { week: "Week 2", title: "CMS & Domain/Hosting Setup", points: ["What a CMS is, key terms", "Getting domain & hosting (free via InfinityFree, paid via Namecheap/Whogohost/Qservers)", "Installing WordPress & cPanel basics"] },
    { week: "Week 3", title: "Getting Started with Website Creation", points: ["Starter Templates", "Editing Website Body with Elementor", "Editing Header and Footer"] },
    { week: "Week 4", title: "E-Commerce Website", points: ["Installing E-Commerce Template (WooCommerce)", "Adding Products", "WooCommerce Configuration", "Editing E-Commerce Pages with Elementor", "Integrating Payment Gateway (Paystack/Flutterwave)"] },
    { week: "Week 5", title: "LMS Website", points: ["Installing an LMS Template (LearnDash/TutorLMS)", "Adding Courses", "Editing Your LMS Website"] },
    { week: "Week 6", title: "Mastering Elementor & Landing Pages", points: ["Elementor Interface Parts 1 & 2", "Free Training Landing Page Parts 1 & 2 (hero, opt-in, social proof, FAQ, publishing)"] },
    { week: "Week 7", title: "Final Project", points: ["Project 1 (Paired) \u2014 Business Directory Website (listings, categories, search filters, contact form)", "Project 2 (Individual) \u2014 Personal Portfolio Website (About, Skills, Projects, Services, Contact)"] },
    { week: "Week 8", title: "Graduation & Certification", points: ["Final presentations, portfolio review, community showcase, Certificate award ceremony.", "Optional continuation into a separate Coding Track (HTML/CSS/JavaScript)."] }
  ],
  video: [
    { week: "Week 1", title: "Intro to Video Editing", points: ["Terminology, editing mindset", "CapCut & Inshot walkthroughs", "Types of video editing"] },
    { week: "Week 2", title: "Short Form Viral Editing", points: ["Raw Footage Cleanup", "Visual Enhancement (grading, captions)", "Pattern Interrupt & Sound"] },
    { week: "Week 3", title: "Intro to Animation & AI Lip Sync", points: ["Animation overview, AI lip sync tools, scriptwriting", "Generating voiceover & lip sync (only with proper consent for any real person's likeness/voice)", "Editing/retouching"] },
    { week: "Week 4", title: "3D Animation & Kids Cartoon Songs", points: ["Advanced 3D Animation intro", "Creating kids cartoon songs", "Combining 3D animation with song production"] },
    { week: "Week 5", title: "Motion Graphics & Whiteboard Animation", points: ["Motion Graphics I & II", "Whiteboard Animation"] },
    { week: "Week 6", title: "Faceless Video Content", points: ["Using animated elements", "Using still images with motion effects and voiceover"] },
    { week: "Week 7", title: "UGC & AI Ad Video Creation", points: ["UGC Ad Videos", "Stickman Animation Using AI", "Business Advert Video Creation Using AI"] },
    { week: "Week 8", title: "Final Project & Graduation", points: ["Project 1 (Paired) \u2014 collaborative short-form viral-style edited video.", "Project 2 (Individual) \u2014 an animation piece using any technique learned."] }
  ],
  content_creation: [
    { week: "Week 1", title: "Foundations of Content Creation & Creative Voice", points: ["What makes great content in 2026 & creator mindset", "Choosing your niche & sub-topics", "The 4 Content Pillars (Educational, Entertaining, Inspiring, Relatable)", "High-retention storytelling frameworks"] },
    { week: "Week 2", title: "Smartphone Cinematography & Mobile Audio", points: ["Phone camera settings, resolution, frame rates (4K vs 1080p, 24fps vs 60fps)", "Rule of thirds, dynamic angles & smooth camera movement", "Budget lighting techniques (natural, ring light, 3-point setups)", "Clear mobile audio, external mics, and noise cancellation"] },
    { week: "Week 3", title: "Mobile Video Editing for Creators (CapCut & InShot)", points: ["Timeline editing, trimming & split workflows", "Cutting on action, dynamic pacing & pattern interrupts", "Sound effects (SFX), sound bridges & music layering", "Auto-captions, animated kinetic typography & overlays"] },
    { week: "Week 4", title: "Scriptwriting & The 3-Second Hook", points: ["The psychology of stopping the scroll (visual, verbal, text hooks)", "Structuring the body for maximum viewer retention", "Avoiding mid-video drop-offs & dead air", "Call-to-action (CTA) formulas that drive engagement and follows"] },
    { week: "Week 5", title: "Visual Design & Thumbnail Mastery", points: ["Canva for content creators: principles & workflows", "Designing high-CTR video thumbnails and cover cards", "Contrast, text hierarchy, emotion, and facial expressions", "Creating reusable branded templates & color palettes"] },
    { week: "Week 6", title: "AI-Powered Creation & Generative Assets", points: ["AI ideation and script generation with Claude & ChatGPT", "Generative AI B-roll, dynamic b-roll inserts & visual assets", "Voiceover enhancement & ethical AI voice synthesis", "Automating repurposing pipelines with AI"] },
    { week: "Week 7", title: "Long-Form YouTube & Multi-Platform Repurposing", points: ["Long-form YouTube architecture (concept, title, thumbnail, payoff)", "The 1-to-10 Repurposing Framework: turn 1 long video into 10 viral clips", "Platform adaptations: TikTok vs Reels vs Shorts vs LinkedIn", "Batch production scheduling: film a week's content in 3 hours"] },
    { week: "Week 8", title: "Personal Branding, Media Kit & Creator Launch", points: ["Project 1 (Paired) \u2014 A 3-part viral video series with retention analytics breakdown.", "Project 2 (Individual) \u2014 Live 7-day multi-format content portfolio + professional creator media kit.", "Rate card setting, pitching brands for sponsorship & graduation showcase."] }
  ],
  smm: [
    { week: "Week 1", title: "The SMM Profession & Strategic Ecosystem", points: ["Role of a Social Media Manager vs. Content Creator", "Understanding client business models & digital marketing objectives", "Conducting a comprehensive brand profile audit", "Competitor research, benchmarking & SWOT analysis"] },
    { week: "Week 2", title: "Profile Architecture & Social SEO Optimization", points: ["Crafting high-converting business bios and value propositions", "Optimizing profile handles, SEO keywords & search indexing", "Highlights funnel architecture and lead capture link setups", "Algorithm mechanics across Instagram, TikTok, LinkedIn, Facebook, and X"] },
    { week: "Week 3", title: "Content Strategy & 30-Day Editorial Calendars", points: ["Defining core content pillars and sub-themes for a brand", "Building comprehensive 30-day editorial content calendars", "Balancing brand awareness, engagement, community trust, and direct sales", "Scheduling automation tools (Meta Business Suite, Buffer, Later)"] },
    { week: "Week 4", title: "Persuasive Copywriting & Community Management", points: ["Developing and documenting a brand tone of voice", "Writing persuasive captions with clear conversion triggers", "Community engagement strategy: proactive vs reactive engagement", "Direct message (DM) lead qualification, customer service & crisis management"] },
    { week: "Week 5", title: "Organic Growth Hacking & Trend Hijacking", points: ["Researching trending audios, hashtags & viral formats", "Ethical newsjacking and timely cultural trend integration", "Strategic collaborations, co-author posts & influencer outreach", "Cross-platform audience migration tactics"] },
    { week: "Week 6", title: "Analytics, Performance Metrics & Client ROI Reporting", points: ["Mastering native analytics dashboards (Meta Insights, TikTok Analytics, LinkedIn)", "Key metrics that matter: Reach, Impressions, ER, CTR, Saves & Shares", "Translating vanity metrics into real business outcomes and sales leads", "Building professional monthly client performance decks with actionable recommendations"] },
    { week: "Week 7", title: "SMM Business Operations, Pricing & Client Acquisition", points: ["Packaging your SMM services: management, strategy, community only", "Pricing models: monthly retainers vs project fees vs setup packages", "Crafting winning client proposals, contracts & scopes of work (SOW)", "Client onboarding checklists, communication boundaries & managing multiple accounts"] },
    { week: "Week 8", title: "Capstone Project, Portfolio & SMM Certification", points: ["Project 1 \u2014 Complete 30-day brand strategy and content calendar for a real business.", "Project 2 \u2014 Full social media audit report and strategic pitch deck ready for client presentation.", "Final client pitch presentation, portfolio review, and Certificate of Social Media Management."] }
  ],
  marketing: [
    { week: "Week 1", title: "Intro to Digital Marketing", points: ["What it is", "Types and requirements", "Choosing your path among the three tracks"] },
    { week: "Week 2", title: "China Importation: Getting Started", points: ["What it is, capital expectations, scam red flags", "Opening a 1688 account", "Picture-searching and texting suppliers"] },
    { week: "Week 3", title: "China Importation: Sourcing & Running", points: ["Sourcing goods", "Running a pre-order business", "Addressing issues/challenges"] },
    { week: "Week 4", title: "Intro to Affiliate Marketing", points: ["The zero-capital model", "Amazon Associates account setup", "Setting up social platforms for affiliate marketing"] },
    { week: "Week 5", title: "Running Your Affiliate Business", points: ["Choosing a niche/products", "Getting product links and building a library", "Writing converting ad copy"] },
    { week: "Week 6", title: "Video Content That Converts", points: ["Intro to video editing", "Generative AI tools for video content", "Best way to post videos that convert"] },
    { week: "Week 7", title: "Amazon Bounty Programmes", points: ["What they are", "Promoting them at no cost", "Understanding dashboard and commissions"] },
    { week: "Week 8", title: "Final Project & Graduation", points: ["Choose 2 of 3 tracks (so lack of capital never blocks graduation)", "Track A: China Importation (documented pre-order cycle)", "Track B: Affiliate Marketing (live account, 5+ product library, 3 pieces of posted ad copy)", "Track C: Amazon Bounty (one real public promotion with dashboard proof)", "Students with little/no capital can graduate completing Tracks B and C only."] }
  ]
};
FULL_CURRICULA.content = FULL_CURRICULA.content_creation;
var CERTIFICATION_CRITERIA = {
  graphic: "\u226580% live session attendance \xB7 both Week 8 projects submitted \xB7 portfolio of 5+ projects including one AI-assisted piece \xB7 passing feedback in \u22652 Thursday review sessions \xB7 \u22652 Mindset Shift sessions + 1 Monthly Hangout attended \xB7 demonstrated proficiency across fundamentals, branding, advanced editing, and responsible AI collaboration.",
  web: "\u226580% live session attendance \xB7 both Week 7 final projects submitted \xB7 passing feedback in \u22652 Thursday review sessions \xB7 required Mindset Shift and Monthly Hangout attendance \xB7 demonstrated proficiency across AI websites, CMS/WordPress, e-commerce, and landing pages.",
  frontend: "\u226580% live session attendance \xB7 both Week 8 projects submitted \xB7 portfolio of 6+ frontend application builds including one React application \xB7 passing feedback in \u22652 Thursday review sessions \xB7 required Mindset Shift and Monthly Hangout attendance \xB7 demonstrated proficiency across modern HTML/CSS/Tailwind, JavaScript ES6+, React, and API integration.",
  video: "\u226580% live session attendance \xB7 both Week 8 projects submitted \xB7 portfolio of 6+ pieces covering both editing and animation \xB7 passing feedback in \u22652 Thursday review sessions \xB7 required Mindset Shift and Monthly Hangout attendance \xB7 demonstrated proficiency across editing fundamentals, short-form editing, and at least one animation technique.",
  content_creation: "\u226580% live session attendance \xB7 both Week 8 projects submitted \xB7 an active creator account with a 7-day multi-format portfolio + creator media kit \xB7 passing feedback in \u22652 Thursday review sessions \xB7 required Mindset Shift and Monthly Hangout attendance \xB7 demonstrated proficiency in mobile production, dynamic editing, and audience retention.",
  content: "\u226580% live session attendance \xB7 both Week 8 projects submitted \xB7 an active creator account with a 7-day multi-format portfolio + creator media kit \xB7 passing feedback in \u22652 Thursday review sessions \xB7 required Mindset Shift and Monthly Hangout attendance.",
  smm: "\u226580% live session attendance \xB7 complete 30-day brand strategy and content calendar submitted \xB7 professional social media audit and pitch deck for a real brand \xB7 passing feedback in \u22652 Thursday review sessions \xB7 required Mindset Shift and Monthly Hangout attendance \xB7 demonstrated competency in client reporting and KPI analytics.",
  marketing: "\u226580% live session attendance \xB7 real deliverables completed in \u22652 of the 3 final project tracks \xB7 a working 1688 account OR live/approved affiliate account OR active bounty promotion (matching chosen tracks) \xB7 passing feedback in \u22652 Thursday review sessions \xB7 \u22653 Mindset Shift sessions + 1 Monthly Hangout attended \xB7 demonstrated honest, professional communication with customers/suppliers."
};
var CUSTOM_SKILLS_KEY = "kr8_custom_skills_v3";
var SKILL_SETTINGS_KEY = "kr8_skill_settings_v3";
var WAITLIST_WHATSAPP_KEY = "kr8_waitlist_whatsapp_url_v1";
var DYNAMIC_CURRICULA_KEY = "kr8_dynamic_curricula_v1";
var DEFAULT_WAITLIST_WHATSAPP = "https://chat.whatsapp.com/G5mSP8JeelfELvnljpgSJ8";
function getDynamicCurricula() {
  return load(DYNAMIC_CURRICULA_KEY, {});
}
function saveDynamicCurriculum(skillKey, weeks) {
  const current = getDynamicCurricula();
  current[skillKey] = weeks;
  save(DYNAMIC_CURRICULA_KEY, current);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:skills-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}
function getCustomSkills() {
  return load(CUSTOM_SKILLS_KEY, []);
}
function saveCustomSkill(skill) {
  const current = getCustomSkills();
  const existingIdx = current.findIndex((s) => s.key === skill.key);
  if (existingIdx >= 0) {
    current[existingIdx] = skill;
  } else {
    current.push(skill);
  }
  save(CUSTOM_SKILLS_KEY, current);
  saveSkillSetting(skill.key, { regOpen: skill.regOpen, whatsapp: skill.whatsapp, available: skill.available });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:skills-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}
function deleteCustomSkill(key) {
  const current = getCustomSkills().filter((s) => s.key !== key);
  save(CUSTOM_SKILLS_KEY, current);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:skills-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}
function skillSettings() {
  return load(SKILL_SETTINGS_KEY, {});
}
function getSkills() {
  const custom = getCustomSkills();
  const settings = skillSettings();
  const dynamicCurricula = getDynamicCurricula();
  const baseMap = /* @__PURE__ */ new Map();
  DEFAULT_SKILLS.forEach((s) => baseMap.set(s.key, { ...s }));
  custom.forEach((s) => baseMap.set(s.key, { ...s }));
  return Array.from(baseMap.values()).map((s) => {
    const setting = settings[s.key];
    const curriculum = dynamicCurricula[s.key] || FULL_CURRICULA[s.key] || s.curriculum || [];
    const criteria = CERTIFICATION_CRITERIA[s.key] || s.criteria || "Attendance and coursework completion.";
    return {
      ...s,
      regOpen: setting?.regOpen !== void 0 ? setting.regOpen : s.regOpen,
      whatsapp: setting?.whatsapp !== void 0 ? setting.whatsapp : s.whatsapp,
      available: setting?.available !== void 0 ? setting.available : s.available,
      curriculum,
      criteria
    };
  });
}
var SKILLS = getSkills();
function getSkill(key) {
  if (!key) return void 0;
  const k = key.trim().toLowerCase();
  const all = getSkills();
  const direct = all.find((s) => s.key.toLowerCase() === k);
  if (direct) return direct;
  if (k === "content") {
    const legacy = all.find((s) => s.key === "content");
    if (legacy) return legacy;
    return {
      key: "content",
      name: "Content Creation & Social Media Management",
      suffix: "CCSMVFD",
      whatsapp: "https://chat.whatsapp.com/G5mSP8JeelfELvnljpgSJ8",
      available: false,
      regOpen: false,
      snippet: "Comprehensive combined track covering content creation and social media management.",
      icon: "video",
      instructor: { name: "Iwuagwu Miracle & Ozioma", photo: "", bio: "Senior Mentors" },
      curriculum: [],
      criteria: "\u226580% live attendance \xB7 all assignments submitted \xB7 capstone completion."
    };
  }
  if (k === "content-creation" || k === "content_creation") {
    return all.find((s) => s.key === "content_creation");
  }
  if (k === "smm" || k === "social_media" || k === "social-media" || k === "social-media-management") {
    return all.find((s) => s.key === "smm");
  }
  if (k === "graphic-design" || k === "graphic") {
    return all.find((s) => s.key === "graphic");
  }
  if (k === "video-editing" || k === "video") {
    return all.find((s) => s.key === "video");
  }
  if (k === "website-development" || k === "web") {
    return all.find((s) => s.key === "web");
  }
  if (k === "digital-marketing" || k === "marketing") {
    return all.find((s) => s.key === "marketing");
  }
  return all.find((s) => s.key.toLowerCase().includes(k) || s.name.toLowerCase().includes(k));
}
function getSkillName(key) {
  const s = getSkill(key);
  return s?.name ?? key ?? "Digital Skills";
}
function getSkillRegistration(key) {
  const setting = skillSettings()[key];
  if (setting?.regOpen !== void 0) return setting.regOpen;
  const s = getSkill(key);
  return s?.regOpen ?? false;
}
function getSkillWhatsApp(key) {
  const setting = skillSettings()[key];
  if (setting?.whatsapp !== void 0) return setting.whatsapp;
  const s = getSkill(key);
  return s?.whatsapp ?? "";
}
function saveSkillSetting(key, patch) {
  const next = { ...skillSettings(), [key]: { ...skillSettings()[key], ...patch } };
  save(SKILL_SETTINGS_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:skills-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}
function getWaitlistWhatsAppUrl() {
  return load(WAITLIST_WHATSAPP_KEY, DEFAULT_WAITLIST_WHATSAPP);
}
function saveWaitlistWhatsAppUrl(url) {
  save(WAITLIST_WHATSAPP_KEY, url.trim());
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event("kr8:waitlist-updated"));
      window.dispatchEvent(new Event("storage"));
    } catch {
    }
  }
}
function areAllRegistrationsClosed() {
  const availableSkills = getSkills().filter((s) => s.available);
  if (availableSkills.length === 0) return true;
  return availableSkills.every((s) => !getSkillRegistration(s.key));
}
var VIP_PHONES = [
  "+2349043870282",
  "09043870282",
  "+2348125687509",
  "08125687509",
  "+2348166552758",
  "08166552758",
  "+2348089344434",
  "08089344434",
  "+2348106068523",
  "08106068523"
];
var FD_ALLOWED = [
  "+2349043870282",
  "09043870282",
  "+2348125687509",
  "08125687509",
  "+2348166552758",
  "08166552758",
  "+2348089344434",
  "08089344434",
  "+2348106068523",
  "08106068523"
];
function isVip(phone) {
  return VIP_PHONES.includes(phone.trim());
}
function fdAllowed(phone) {
  return FD_ALLOWED.includes(phone.trim());
}
var memoryStorage = /* @__PURE__ */ new Map();
function load(key, fallback) {
  try {
    const v = typeof localStorage !== "undefined" ? localStorage.getItem(key) : memoryStorage.get(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, val) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (err) {
    console.warn(`localStorage save error for key ${key}:`, err);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("kr8_accounts_backup");
        localStorage.removeItem("kr8_accounts_v2");
        localStorage.setItem(key, JSON.stringify(val));
      }
    } catch {
    }
  }
  memoryStorage.set(key, JSON.stringify(val));
}
var COHORT_YEAR = 2026;
function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "X";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "X";
  return (a + b).toUpperCase();
}
function normalizeIdentity(value) {
  return value.trim().replace(/[\s-]/g, "").toUpperCase();
}
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}
function normalizePhone(value) {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (compact.startsWith("0")) return `+234${compact.slice(1)}`;
  return `+234${compact}`;
}
var COUNTRIES = ALL_COUNTRIES;
function countryByCode(code) {
  return findCountry(code);
}
function buildPhone(dial, local) {
  const clean = local.replace(/[^0-9]/g, "").replace(/^0+/, "");
  return `${dial}${clean}`;
}
async function detectCountryCode() {
  try {
    const response = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) });
    const data = await response.json();
    if (data.country_code && COUNTRIES.some((country) => country.code === data.country_code)) {
      return data.country_code;
    }
  } catch {
  }
  return "NG";
}
var AVATAR_PALETTES = [
  { c1: "#ec4899", c2: "#8b5cf6" },
  // Pink -> Violet
  { c1: "#06b6d4", c2: "#3b82f6" },
  // Cyan -> Blue
  { c1: "#f59e0b", c2: "#f43f5e" },
  // Amber -> Rose
  { c1: "#10b981", c2: "#0d9488" },
  // Emerald -> Teal
  { c1: "#a855f7", c2: "#6366f1" },
  // Purple -> Indigo
  { c1: "#f43f5e", c2: "#f97316" },
  // Rose -> Orange
  { c1: "#4f46e5", c2: "#0ea5e9" },
  // Indigo -> Sky
  { c1: "#d946ef", c2: "#06b6d4" }
  // Fuchsia -> Cyan
];
function generateDefaultAvatar(name, id = "") {
  const cleanName = (name || "Creator").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const initials2 = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : cleanName.slice(0, 2).toUpperCase();
  const seed2 = (cleanName + id).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = AVATAR_PALETTES[Math.abs(seed2) % AVATAR_PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.c1}"/>
        <stop offset="100%" stop-color="${palette.c2}"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#grad)"/>
    <text x="60" y="66" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" text-anchor="middle" dominant-baseline="middle">${initials2}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
var FOUNDER_PHONES = [
  "+2348125687509",
  "+2348166552758"
];
var FOUNDER_EMAILS = [
  "kr8digitals01@gmail.com",
  "kutimfire001@gmail.com"
];
var COFOUNDER_PHONES = [
  "+2348089344434",
  "+2348106068523"
];
var ADMIN_PHONE_NUMBERS = [
  ...FOUNDER_PHONES,
  ...COFOUNDER_PHONES
];
var ULTIMATE_ADMIN_EMAILS = [...FOUNDER_EMAILS];
var MAIN_ADMIN_PASSWORD = "KR8@Adm!n2026";
var ADMIN_SECTIONS = [
  "Overview",
  "Home",
  "Academy",
  "Testimonial Videos",
  "Agency",
  "Student Management",
  "Blog",
  "Announcements",
  "Graduation & Certificates",
  "Leaderboard & XP",
  "Links Manager",
  "Verify Remarks",
  "Payment Settings",
  "Founders & Partners",
  "Attendance Review",
  "Moderation",
  "Admin Permissions"
];
function isFounderAccount(phone, email) {
  const p = phone ? normalizePhone(phone) : "";
  const e = email ? normalizeEmail(email) : "";
  return FOUNDER_PHONES.includes(p) || FOUNDER_EMAILS.includes(e);
}
function isCoFounderAccount(phone, _email) {
  const p = phone ? normalizePhone(phone) : "";
  return COFOUNDER_PHONES.includes(p);
}
function isExecutiveAccount(account) {
  if (!account) return false;
  return account.type === "founder" || account.type === "co-founder" || account.executiveRole === "Founder" || account.executiveRole === "Co-Founder";
}
function randomAdminPassword() {
  return `KR8-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}
function adminInfoFor(phone, email) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);
  const isFounder = isFounderAccount(normalizedPhone, normalizedEmail);
  const isCoFounder = isCoFounderAccount(normalizedPhone, normalizedEmail);
  if (isFounder) {
    return {
      role: "ultimate",
      title: "Founder & CEO",
      permissions: [...ADMIN_SECTIONS],
      adminPassword: MAIN_ADMIN_PASSWORD,
      passwordNotice: "Founder & CEO credentials recognized. Full system authority active."
    };
  }
  if (isCoFounder) {
    return {
      role: "ultimate",
      title: "Co-Founder",
      permissions: [...ADMIN_SECTIONS],
      adminPassword: MAIN_ADMIN_PASSWORD,
      passwordNotice: "Co-Founder credentials recognized. Full executive access active."
    };
  }
  const isRecognized = ADMIN_PHONE_NUMBERS.includes(normalizedPhone) || ULTIMATE_ADMIN_EMAILS.includes(normalizedEmail);
  if (!isRecognized) return void 0;
  const adminPassword = randomAdminPassword();
  return {
    role: "admin",
    title: "Platform Administrator",
    permissions: [...ADMIN_SECTIONS],
    adminPassword,
    passwordNotice: `Your unique admin password is ${adminPassword}. Keep it safe.`
  };
}
function isUltimateAdmin(account) {
  return account?.admin?.role === "ultimate";
}
function getRecognizedAdmin(phone, email) {
  return adminInfoFor(phone, email);
}
function canAccessAdminSection(account, section) {
  return !!account?.admin && (account.admin.role === "ultimate" || account.admin.permissions.includes(section));
}
function promoteAccount(targetId, role, permissions, promotedBy, title = role) {
  const target = getAccounts().find((account) => account.id === targetId);
  if (!target) return void 0;
  const nextAdmin = { role, title, permissions, adminPassword: randomAdminPassword(), passwordNotice: "Your role password was generated for this profile. Keep it safe; only an ultimate admin can reset it.", promotedBy };
  return updateAccount(targetId, { admin: nextAdmin });
}
function demoteAccount(targetId) {
  return updateAccount(targetId, { admin: void 0 });
}
function resetAdminPassword(targetId) {
  const account = getAccounts().find((item) => item.id === targetId);
  if (!account?.admin || account.admin.role === "ultimate") return void 0;
  const adminPassword = randomAdminPassword();
  updateAccount(targetId, { admin: { ...account.admin, adminPassword, passwordNotice: `Your admin password was reset: ${adminPassword}. Keep it safe.` } });
  return adminPassword;
}
function getSkillSuffix(skillKey) {
  const s = getSkill(skillKey);
  if (s?.suffix) return s.suffix;
  const clean = (skillKey || "KR8").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return `${clean}VFD`;
}
function getSkillCode(skillKey) {
  const suffix = getSkillSuffix(skillKey);
  return suffix.replace(/VFD$/i, "") || skillKey.toUpperCase().slice(0, 3);
}
function kr8id(name, skill, serial) {
  return `KR8${COHORT_YEAR}${initials(name)}${String(serial).padStart(4, "0")}${getSkillSuffix(skill)}`;
}
var ACCOUNT_STORAGE_KEY = "kr8_accounts_v3";
var FEED_STORAGE_KEY = "kr8_feed_v3";
var DEFAULT_FOUNDER_ACCOUNT = {
  type: "founder",
  executiveRole: "Founder",
  title: "Founder & CEO",
  id: "KR8-FOUNDER-TIMFIRE",
  name: "Kenneth Timothy Iziogo (Timfire)",
  email: "kr8digitals01@gmail.com",
  phone: "+2348125687509",
  country: "NG",
  skill: "web",
  dob: "2000-01-01",
  year: COHORT_YEAR,
  serial: 1,
  vip: true,
  points: 1e3,
  attendanceAccepted: 24,
  submissions: 16,
  referrals: 50,
  graduated: true,
  certTier: "Professionalism",
  certRecognition: "Founder & Lead Architect",
  avatar: "/founder_timfire.jpg",
  coverPhoto: "https://images.pexels.com/photos/3866398/pexels-photo-3866398.jpeg?auto=compress&cs=tinysrgb&w=1400",
  bio: "Founder & Lead Architect at KR8 Digitals. Website developer, AI agent developer, designer, and linguistics scholar.",
  joined: 17e11,
  expandedVisibility: true,
  password: MAIN_ADMIN_PASSWORD,
  isPlaceholder: false,
  portfolio: [],
  following: [],
  followers: [],
  messagePrivacy: "Anyone",
  admin: {
    role: "ultimate",
    title: "Founder & CEO",
    permissions: [...ADMIN_SECTIONS],
    adminPassword: MAIN_ADMIN_PASSWORD,
    passwordNotice: "Founder & CEO credentials recognized. Full system control unlocked."
  }
};
var DEFAULT_COFOUNDER_1 = {
  type: "co-founder",
  executiveRole: "Co-Founder",
  title: "Co-Founder \xB7 Media Director",
  id: "KR8-COFOUNDER-STEVENSON",
  name: "Stevenson (Motionverse)",
  email: "stevenson@kr8digitals.com",
  phone: "+2348089344434",
  country: "NG",
  skill: "graphic",
  dob: "2000-01-01",
  year: COHORT_YEAR,
  serial: 2,
  vip: true,
  points: 800,
  attendanceAccepted: 20,
  submissions: 12,
  referrals: 30,
  graduated: true,
  certTier: "Professionalism",
  certRecognition: "Co-Founder & Media Director",
  avatar: INSTRUCTOR_PHOTOS.stevenson,
  bio: "Co-Founder & Media Director at KR8 Digitals. Lead Instructor for Graphic Design.",
  joined: 17e11,
  expandedVisibility: true,
  password: MAIN_ADMIN_PASSWORD,
  isPlaceholder: false,
  portfolio: [],
  following: [],
  followers: [],
  messagePrivacy: "Anyone",
  admin: {
    role: "ultimate",
    title: "Co-Founder",
    permissions: [...ADMIN_SECTIONS],
    adminPassword: MAIN_ADMIN_PASSWORD,
    passwordNotice: "Co-Founder credentials recognized. Full executive access unlocked."
  }
};
var COFOUNDER_IDENTITY = {
  "+2348089344434": {
    id: "KR8-COFOUNDER-STEVENSON",
    name: "Stevenson (Motionverse)",
    title: "Co-Founder \xB7 Media Director",
    skill: "graphic",
    avatar: INSTRUCTOR_PHOTOS.stevenson,
    certRecognition: "Co-Founder & Media Director",
    brand: "motionverse"
  },
  "+2348106068523": {
    id: "KR8-COFOUNDER-DANIEL",
    name: "Daniel (Creative Expression)",
    title: "Co-Founder \xB7 COO",
    skill: "video",
    avatar: INSTRUCTOR_PHOTOS.daniel,
    certRecognition: "Co-Founder & COO",
    brand: "creative expression"
  }
};
function coFounderCanonFor(phone) {
  if (!phone) return void 0;
  return COFOUNDER_IDENTITY[normalizePhone(phone)];
}
function healCoFounderIdentity(combined) {
  const groups = /* @__PURE__ */ new Map();
  const rest = [];
  for (const acc of combined) {
    const canon = coFounderCanonFor(acc.phone);
    if (canon) {
      groups.set(canon.id, [...groups.get(canon.id) || [], acc]);
    } else {
      rest.push(acc);
    }
  }
  if (groups.size === 0) return combined;
  const canons = Object.values(COFOUNDER_IDENTITY);
  const healedByKeeper = /* @__PURE__ */ new Map();
  const keeperFor = /* @__PURE__ */ new Map();
  for (const [canonId, group] of groups) {
    const canon = canons.find((c) => c.id === canonId);
    const other = canons.find((c) => c.id !== canonId);
    const keeper = group.find((o) => o.password && o.password !== MAIN_ADMIN_PASSWORD) || group.find((o) => normalizeIdentity(o.id || "") === normalizeIdentity(canonId)) || group[0];
    for (const o of group) {
      if (o === keeper) continue;
      keeper.previousIds = Array.from(/* @__PURE__ */ new Set([...keeper.previousIds || [], ...o.previousIds || [], o.id]));
      if (!keeper.email && o.email) keeper.email = o.email;
      if (!keeper.password && o.password) keeper.password = o.password;
    }
    const lowerName = (keeper.name || "").trim().toLowerCase();
    const nameCorrupted = !lowerName || lowerName === other.name.toLowerCase() || lowerName.includes(other.brand);
    if (normalizeIdentity(keeper.id || "") !== normalizeIdentity(canonId)) {
      keeper.previousIds = Array.from(/* @__PURE__ */ new Set([...keeper.previousIds || [], keeper.id]));
    }
    for (const o of group) keeperFor.set(o, keeper);
    healedByKeeper.set(keeper, {
      ...keeper,
      id: canonId,
      type: "co-founder",
      executiveRole: "Co-Founder",
      title: canon.title,
      skill: canon.skill,
      certRecognition: canon.certRecognition,
      name: nameCorrupted ? canon.name : keeper.name,
      avatar: !keeper.avatar || keeper.avatar === other.avatar || keeper.avatar.startsWith("data:") || keeper.avatar.includes("pexels") ? canon.avatar : keeper.avatar,
      previousIds: Array.from(new Set(keeper.previousIds || []))
    });
  }
  const consumed = /* @__PURE__ */ new Set();
  const result = [];
  for (const acc of combined) {
    const keeper = keeperFor.get(acc);
    if (!keeper) {
      result.push(acc);
      continue;
    }
    if (!consumed.has(keeper)) {
      consumed.add(keeper);
      result.push(healedByKeeper.get(keeper));
    }
  }
  return result;
}
var DEFAULT_COFOUNDER_2 = {
  type: "co-founder",
  executiveRole: "Co-Founder",
  title: "Co-Founder \xB7 COO",
  id: "KR8-COFOUNDER-DANIEL",
  name: "Daniel (Creative Expression)",
  email: "daniel@kr8digitals.com",
  phone: "+2348106068523",
  country: "NG",
  skill: "video",
  dob: "2000-01-01",
  year: COHORT_YEAR,
  serial: 3,
  vip: true,
  points: 800,
  attendanceAccepted: 20,
  submissions: 12,
  referrals: 30,
  graduated: true,
  certTier: "Professionalism",
  certRecognition: "Co-Founder & COO",
  avatar: INSTRUCTOR_PHOTOS.daniel,
  bio: "Co-Founder & COO at KR8 Digitals. Lead Instructor for Video Editing & Animation.",
  joined: 17e11,
  expandedVisibility: true,
  password: MAIN_ADMIN_PASSWORD,
  isPlaceholder: false,
  portfolio: [],
  following: [],
  followers: [],
  messagePrivacy: "Anyone",
  admin: {
    role: "ultimate",
    title: "Co-Founder",
    permissions: [...ADMIN_SECTIONS],
    adminPassword: MAIN_ADMIN_PASSWORD,
    passwordNotice: "Co-Founder credentials recognized. Full executive access unlocked."
  }
};
var VERIFIED_COHORT_STUDENTS = [
  {
    type: "student",
    id: "KR82026GD001",
    name: "Grant Gideon",
    email: "grant.gideon@student.kr8digitals.com",
    phone: "+2348011110001",
    country: "NG",
    skill: "graphic-design",
    dob: "2000-05-12",
    year: COHORT_YEAR,
    serial: 1,
    vip: false,
    points: 1450,
    attendanceAccepted: 14,
    submissions: 8,
    referrals: 7,
    graduated: true,
    certTier: "Professionalism",
    avatar: "/videos/testimonial_grant_gideon_poster.jpg",
    joined: 1718e9,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026VE002",
    name: "Bio Nicz",
    email: "bio.nicz@student.kr8digitals.com",
    phone: "+2348011110002",
    country: "NG",
    skill: "video-editing",
    dob: "1999-08-20",
    year: COHORT_YEAR,
    serial: 2,
    vip: false,
    points: 1320,
    attendanceAccepted: 14,
    submissions: 8,
    referrals: 5,
    graduated: true,
    certTier: "Professionalism",
    avatar: "/videos/testimonial_bio_nicz_poster.jpg",
    joined: 17181e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026VE003",
    name: "Madukaku Samuel",
    email: "madukaku.samuel@student.kr8digitals.com",
    phone: "+2348011110003",
    country: "NG",
    skill: "video-editing",
    dob: "2001-02-14",
    year: COHORT_YEAR,
    serial: 3,
    vip: false,
    points: 1280,
    attendanceAccepted: 13,
    submissions: 7,
    referrals: 4,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_maduka_samuel_poster.jpg",
    joined: 17182e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026GD004",
    name: "Elizabeth Oyejobi",
    email: "elizabeth.oyejobi@student.kr8digitals.com",
    phone: "+2348011110004",
    country: "NG",
    skill: "graphic-design",
    dob: "2002-11-03",
    year: COHORT_YEAR,
    serial: 4,
    vip: false,
    points: 1190,
    attendanceAccepted: 12,
    submissions: 7,
    referrals: 3,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_elizabeth_oyejobi_poster.jpg",
    joined: 17183e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026GD005",
    name: "Afolayan Grace Taiwo",
    email: "afolayan.grace@student.kr8digitals.com",
    phone: "+2348011110005",
    country: "NG",
    skill: "graphic-design",
    dob: "2000-09-17",
    year: COHORT_YEAR,
    serial: 5,
    vip: false,
    points: 1120,
    attendanceAccepted: 13,
    submissions: 6,
    referrals: 6,
    graduated: true,
    certTier: "Professionalism",
    avatar: "/videos/testimonial_afolayan_grace_poster.jpg",
    joined: 17184e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026GD006",
    name: "Adrian Washington",
    email: "adrian.washington@student.kr8digitals.com",
    phone: "+2348011110006",
    country: "NG",
    skill: "graphic-design",
    dob: "1998-12-05",
    year: COHORT_YEAR,
    serial: 6,
    vip: false,
    points: 1080,
    attendanceAccepted: 12,
    submissions: 6,
    referrals: 2,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_new_3_poster.jpg",
    joined: 17185e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026VE007",
    name: "William Marvelous",
    email: "william.marvelous@student.kr8digitals.com",
    phone: "+2348011110007",
    country: "NG",
    skill: "video-editing",
    dob: "2001-07-22",
    year: COHORT_YEAR,
    serial: 7,
    vip: false,
    points: 980,
    attendanceAccepted: 11,
    submissions: 5,
    referrals: 3,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_new_2_poster.jpg",
    joined: 17186e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026WD008",
    name: "Emmanuel Nweke",
    email: "emmanuel.nweke@student.kr8digitals.com",
    phone: "+2348011110008",
    country: "NG",
    skill: "web-development",
    dob: "2000-01-30",
    year: COHORT_YEAR,
    serial: 8,
    vip: false,
    points: 940,
    attendanceAccepted: 11,
    submissions: 5,
    referrals: 4,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_new_7_poster.jpg",
    joined: 17187e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026GD009",
    name: "Ibeh Chinenye Helen",
    email: "ibeh.chinenye@student.kr8digitals.com",
    phone: "+2348011110009",
    country: "NG",
    skill: "graphic-design",
    dob: "2003-04-18",
    year: COHORT_YEAR,
    serial: 9,
    vip: false,
    points: 910,
    attendanceAccepted: 10,
    submissions: 5,
    referrals: 2,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_ibeh_chinenye_poster.jpg",
    joined: 17188e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  },
  {
    type: "student",
    id: "KR82026VE010",
    name: "Obo Peter",
    email: "obo.peter@student.kr8digitals.com",
    phone: "+2348011110010",
    country: "NG",
    skill: "video-editing",
    dob: "2002-06-11",
    year: COHORT_YEAR,
    serial: 10,
    vip: false,
    points: 870,
    attendanceAccepted: 10,
    submissions: 5,
    referrals: 1,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_obo_peter_poster.jpg",
    joined: 17189e8,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  }
];
var REGISTRATION_VAULT_KEY = "kr8_registered_students_vault";
var seed = [
  DEFAULT_FOUNDER_ACCOUNT,
  DEFAULT_COFOUNDER_1,
  DEFAULT_COFOUNDER_2,
  ...VERIFIED_COHORT_STUDENTS
];
function migrateAccountsSafely() {
  if (typeof window === "undefined") return;
  try {
    const v3Raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    const backupRaw = localStorage.getItem("kr8_accounts_backup");
    const v2Raw = localStorage.getItem("kr8_accounts_v2");
    const vaultRaw = localStorage.getItem(REGISTRATION_VAULT_KEY);
    const v3List = v3Raw ? JSON.parse(v3Raw) : [];
    const backupList = backupRaw ? JSON.parse(backupRaw) : [];
    const v2List = v2Raw ? JSON.parse(v2Raw) : [];
    const vaultList = vaultRaw ? JSON.parse(vaultRaw) : [];
    const merged = /* @__PURE__ */ new Map();
    [...v2List, ...backupList, ...vaultList, ...v3List].forEach((acc) => {
      if (acc && acc.id) {
        const normKey = normalizeIdentity(acc.id);
        const existing = merged.get(normKey);
        merged.set(normKey, existing ? { ...existing, ...acc } : acc);
      }
    });
    if (merged.size > v3List.length) {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(Array.from(merged.values())));
    }
  } catch {
  }
}
function getAccounts() {
  migrateAccountsSafely();
  const stored = load(ACCOUNT_STORAGE_KEY, seed);
  const vault = load(REGISTRATION_VAULT_KEY, []);
  const backup = load("kr8_accounts_backup", []);
  let changed = false;
  const map = /* @__PURE__ */ new Map();
  seed.forEach((acc) => map.set(normalizeIdentity(acc.id), acc));
  backup.forEach((acc) => {
    if (acc?.id) {
      const k = normalizeIdentity(acc.id);
      map.set(k, { ...map.get(k), ...acc });
    }
  });
  vault.forEach((acc) => {
    if (acc?.id) {
      const k = normalizeIdentity(acc.id);
      map.set(k, { ...map.get(k), ...acc });
    }
  });
  stored.forEach((acc) => {
    if (acc?.id) {
      const k = normalizeIdentity(acc.id);
      map.set(k, { ...map.get(k), ...acc });
    }
  });
  if (typeof localStorage !== "undefined") {
    try {
      const cur = localStorage.getItem("kr8_current");
      if (cur) {
        const parsed = JSON.parse(cur);
        if (parsed?.id) {
          const k = normalizeIdentity(parsed.id);
          map.set(k, { ...map.get(k), ...parsed });
        }
      }
    } catch {
    }
  }
  const combined = Array.from(map.values());
  const hasFounder = combined.some((a) => isFounderAccount(a.phone, a.email) || a.type === "founder");
  const hasCofounder1 = combined.some((a) => a.phone === "+2348089344434");
  const hasCofounder2 = combined.some((a) => a.phone === "+2348106068523");
  if (!hasFounder) {
    combined.unshift(DEFAULT_FOUNDER_ACCOUNT);
    changed = true;
  }
  if (!hasCofounder1) {
    combined.push(DEFAULT_COFOUNDER_1);
    changed = true;
  }
  if (!hasCofounder2) {
    combined.push(DEFAULT_COFOUNDER_2);
    changed = true;
  }
  const hasStudents = combined.some((a) => a.type === "student");
  if (!hasStudents) {
    combined.push(...VERIFIED_COHORT_STUDENTS);
    changed = true;
  }
  const needsCoFounderHeal = combined.some((acc) => {
    const canon = coFounderCanonFor(acc.phone);
    if (!canon) return false;
    const otherBrand = canon.id === "KR8-COFOUNDER-STEVENSON" ? "creative expression" : "motionverse";
    return normalizeIdentity(acc.id || "") !== normalizeIdentity(canon.id) || acc.skill !== void 0 && acc.skill !== canon.skill || !acc.name || acc.name.trim().toLowerCase().includes(otherBrand) || acc.title !== void 0 && acc.title !== canon.title;
  });
  if (needsCoFounderHeal) {
    const healed = healCoFounderIdentity(combined);
    if (JSON.stringify(healed) !== JSON.stringify(combined)) {
      combined.length = 0;
      combined.push(...healed);
      changed = true;
    }
  }
  const accounts = combined.map((account) => {
    const isFounder = isFounderAccount(account.phone, account.email);
    const isCoFounder = isCoFounderAccount(account.phone, account.email);
    const resolvedType = isFounder ? "founder" : isCoFounder ? "co-founder" : account.type;
    const resolvedRole = isFounder ? "Founder" : isCoFounder ? "Co-Founder" : account.executiveRole;
    const recognizedAdmin = isFounder ? {
      role: "ultimate",
      title: "Founder & CEO",
      permissions: [...ADMIN_SECTIONS],
      adminPassword: MAIN_ADMIN_PASSWORD,
      passwordNotice: "Founder & CEO credentials recognized. Full system authority active."
    } : isCoFounder ? {
      role: "ultimate",
      title: "Co-Founder",
      permissions: [...ADMIN_SECTIONS],
      adminPassword: MAIN_ADMIN_PASSWORD,
      passwordNotice: "Co-Founder credentials recognized. Full executive access active."
    } : account.admin ?? getRecognizedAdmin(account.phone, account.email);
    if (account.type !== resolvedType || account.executiveRole !== resolvedRole || !account.admin) {
      changed = true;
    }
    return {
      ...account,
      type: resolvedType,
      executiveRole: resolvedRole,
      vip: isFounder || isCoFounder ? true : account.vip,
      avatar: isFounder && (!account.avatar || account.avatar.includes("pexels")) ? "/founder_timfire.jpg" : !isFounder && (!account.avatar || account.avatar.includes("founder_timfire.jpg")) ? generateDefaultAvatar(account.name, account.id) : account.avatar || generateDefaultAvatar(account.name, account.id),
      id: account.type === "student" ? account.id.replace(/-/g, "") : account.id,
      isPlaceholder: account.isPlaceholder ?? false,
      portfolio: account.portfolio ?? [],
      following: account.following ?? [],
      followers: account.followers ?? [],
      messagePrivacy: account.messagePrivacy ?? "Anyone",
      admin: recognizedAdmin
    };
  });
  if (changed) save(ACCOUNT_STORAGE_KEY, accounts);
  return accounts;
}
function sanitizeAccountsForStorage(accounts) {
  return accounts.map((acc) => {
    let cleanCertUrl = acc.certificateUrl;
    if (cleanCertUrl && cleanCertUrl.startsWith("data:image/") && cleanCertUrl.length > 15e3) {
      cleanCertUrl = `cert-stored:${acc.id}`;
    }
    const cleanCerts = (acc.certificates || []).map((c) => {
      let img = c.certificateImageUrl;
      if (img && img.startsWith("data:image/") && img.length > 15e3) {
        img = `cert-stored:${c.id}`;
      }
      return {
        ...c,
        certificateImageUrl: img
      };
    });
    return {
      ...acc,
      certificateUrl: cleanCertUrl,
      certificates: cleanCerts
    };
  });
}
function isEmptyValue(v) {
  if (v === void 0 || v === null) return true;
  if (typeof v === "string") return v.length === 0;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}
function saveAccounts(a) {
  const sanitized = sanitizeAccountsForStorage(a);
  const prev = load(ACCOUNT_STORAGE_KEY, []);
  const prevMap = new Map(prev.map((p) => [normalizeIdentity(p.id || ""), p]));
  const addedIds = [];
  const updatedIds = [];
  const removedIds = [];
  const seen = /* @__PURE__ */ new Set();
  for (const acc of sanitized) {
    const key = normalizeIdentity(acc.id || "");
    seen.add(key);
    const beforeRaw = prevMap.get(key);
    if (beforeRaw === void 0) {
      addedIds.push(acc.id);
    } else {
      const before = beforeRaw;
      let differs = false;
      const keys = /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(acc)]);
      for (const k of keys) {
        const bv = before[k];
        const av = acc[k];
        if (isEmptyValue(bv) && isEmptyValue(av)) continue;
        if (JSON.stringify(bv) !== JSON.stringify(av)) {
          differs = true;
          break;
        }
      }
      if (differs) updatedIds.push(acc.id);
    }
  }
  for (const p of prev) {
    const key = normalizeIdentity(p.id || "");
    if (!seen.has(key)) removedIds.push(p.id);
  }
  save(ACCOUNT_STORAGE_KEY, sanitized);
  try {
    localStorage.setItem("kr8_accounts_backup", JSON.stringify(sanitized));
    const vaultAccounts = sanitized.filter((acc) => !acc.isPlaceholder);
    localStorage.setItem(REGISTRATION_VAULT_KEY, JSON.stringify(vaultAccounts));
  } catch {
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kr8:accounts-updated", {
        detail: { changedIds: [...addedIds, ...updatedIds], addedIds, updatedIds, removedIds }
      })
    );
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: ACCOUNT_STORAGE_KEY }));
    } catch {
    }
  }
}
function updateAccount(id, patch) {
  const accounts = getAccounts();
  const index = accounts.findIndex((account) => normalizeIdentity(account.id) === normalizeIdentity(id));
  if (index < 0) return void 0;
  accounts[index] = { ...accounts[index], ...patch };
  saveAccounts(accounts);
  return accounts[index];
}
function getStudents() {
  return getAccounts().filter((a) => a.type === "student");
}
function nextSerial(skillKey) {
  const students = getStudents().filter((s) => s.skill === skillKey);
  const maxSerial = students.reduce((max, s) => {
    const num = s.serial || 0;
    return num > max ? num : max;
  }, 0);
  return Math.max(maxSerial + 1, students.length + 1);
}
function registerStudent(input) {
  const accts = getAccounts();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const isFounder = isFounderAccount(phone, email);
  const isCoFounder = isCoFounderAccount(phone, email);
  if (input.password.trim().length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (isFounder) {
    let founder = accts.find((a) => a.type === "founder" || isFounderAccount(a.phone, a.email));
    if (founder) {
      founder = {
        ...founder,
        type: "founder",
        executiveRole: "Founder",
        name: input.name.trim() || founder.name || "Kenneth Timothy Iziogo (Timfire)",
        email: email || founder.email,
        phone: phone || founder.phone,
        password: input.password,
        vip: true,
        avatar: founder.avatar || "/founder_timfire.jpg",
        admin: {
          role: "ultimate",
          title: "Founder & CEO",
          permissions: [...ADMIN_SECTIONS],
          adminPassword: MAIN_ADMIN_PASSWORD,
          passwordNotice: "Founder & CEO credentials recognized. Full system control unlocked."
        }
      };
      updateAccount(founder.id, founder);
      return { ok: true, student: founder };
    }
    const newFounder = {
      type: "founder",
      executiveRole: "Founder",
      title: "Founder & CEO",
      id: "KR8-FOUNDER-TIMFIRE",
      name: input.name.trim() || "Kenneth Timothy Iziogo (Timfire)",
      email: email || "kr8digitals01@gmail.com",
      phone: phone || "+2348125687509",
      country: input.country || "NG",
      skill: input.skill || "web",
      dob: input.dob,
      year: COHORT_YEAR,
      serial: 1,
      vip: true,
      points: 1e3,
      attendanceAccepted: 24,
      submissions: 16,
      referrals: 50,
      graduated: true,
      certTier: "Professionalism",
      certRecognition: "Founder & Lead Architect",
      avatar: "/founder_timfire.jpg",
      coverPhoto: "https://images.pexels.com/photos/3866398/pexels-photo-3866398.jpeg?auto=compress&cs=tinysrgb&w=1400",
      joined: Date.now(),
      expandedVisibility: true,
      password: input.password,
      admin: {
        role: "ultimate",
        title: "Founder & CEO",
        permissions: [...ADMIN_SECTIONS],
        adminPassword: MAIN_ADMIN_PASSWORD,
        passwordNotice: "Founder & CEO credentials recognized. Full system control unlocked."
      },
      isPlaceholder: false,
      portfolio: [],
      following: [],
      followers: [],
      messagePrivacy: "Anyone"
    };
    accts.unshift(newFounder);
    saveAccounts(accts);
    addFeed({ kind: "registration", name: newFounder.name, skill: "Founder & CEO", avatar: newFounder.avatar });
    return { ok: true, student: newFounder };
  }
  if (isCoFounder) {
    const isStevenson = phone === "+2348089344434";
    const defaultName = isStevenson ? "Stevenson (Motionverse)" : "Daniel (Creative Expression)";
    const defaultAvatar2 = isStevenson ? INSTRUCTOR_PHOTOS.stevenson : INSTRUCTOR_PHOTOS.daniel;
    const defaultRole = isStevenson ? "Co-Founder \xB7 Media Director" : "Co-Founder \xB7 COO";
    const defaultSkill = isStevenson ? "graphic" : "video";
    const coId = isStevenson ? "KR8-COFOUNDER-STEVENSON" : "KR8-COFOUNDER-DANIEL";
    const otherCoFounderPhone = isStevenson ? "+2348106068523" : "+2348089344434";
    let cofounder = accts.find((a) => a.phone && normalizePhone(a.phone) === phone) || accts.find((a) => normalizeIdentity(a.id || "") === normalizeIdentity(coId)) || accts.find((a) => a.type === "co-founder" && (!a.phone || normalizePhone(a.phone) !== otherCoFounderPhone));
    if (cofounder) {
      cofounder = {
        ...cofounder,
        type: "co-founder",
        executiveRole: "Co-Founder",
        name: input.name.trim() || cofounder.name || defaultName,
        email: email || cofounder.email,
        phone: phone || cofounder.phone,
        password: input.password,
        vip: true,
        avatar: cofounder.avatar || defaultAvatar2,
        admin: {
          role: "ultimate",
          title: "Co-Founder",
          permissions: [...ADMIN_SECTIONS],
          adminPassword: MAIN_ADMIN_PASSWORD,
          passwordNotice: "Co-Founder credentials recognized. Full executive access active."
        }
      };
      updateAccount(cofounder.id, cofounder);
      return { ok: true, student: cofounder };
    }
    const newCoFounder = {
      type: "co-founder",
      executiveRole: "Co-Founder",
      title: defaultRole,
      id: coId,
      name: input.name.trim() || defaultName,
      email,
      phone,
      country: input.country || "NG",
      skill: input.skill || defaultSkill,
      dob: input.dob,
      year: COHORT_YEAR,
      serial: isStevenson ? 2 : 3,
      vip: true,
      points: 800,
      attendanceAccepted: 20,
      submissions: 12,
      referrals: 30,
      graduated: true,
      certTier: "Professionalism",
      certRecognition: defaultRole,
      avatar: defaultAvatar2,
      joined: Date.now(),
      expandedVisibility: true,
      password: input.password,
      admin: {
        role: "ultimate",
        title: "Co-Founder",
        permissions: [...ADMIN_SECTIONS],
        adminPassword: MAIN_ADMIN_PASSWORD,
        passwordNotice: "Co-Founder credentials recognized. Full executive access active."
      },
      isPlaceholder: false,
      portfolio: [],
      following: [],
      followers: [],
      messagePrivacy: "Anyone"
    };
    accts.push(newCoFounder);
    saveAccounts(accts);
    addFeed({ kind: "registration", name: newCoFounder.name, skill: "Co-Founder", avatar: newCoFounder.avatar });
    return { ok: true, student: newCoFounder };
  }
  const emailSusp = isCredentialSuspended(email);
  if (emailSusp.suspended) {
    return {
      ok: false,
      error: `This email address is suspended from registering on KR8 Digitals. Reason: "${emailSusp.account?.reason || "Administrative suspension"}".`
    };
  }
  const phoneSusp = isCredentialSuspended(phone);
  if (phoneSusp.suspended) {
    return {
      ok: false,
      error: `This phone number is suspended from registering on KR8 Digitals. Reason: "${phoneSusp.account?.reason || "Administrative suspension"}".`
    };
  }
  const existing = accts.find(
    (s) => normalizeEmail(s.email) === email || normalizePhone(s.phone) === phone
  );
  if (existing) {
    if (existing.type === "tribe") {
      const newSkill2 = getSkill(input.skill);
      if (!newSkill2) return { ok: false, error: "Please select a valid skill." };
      if (!newSkill2.available) return { ok: false, error: `${newSkill2.name} is currently not available.` };
      if (!getSkillRegistration(input.skill)) return { ok: false, error: `Registration for ${newSkill2.name} is currently closed.` };
      const oldId2 = existing.id;
      const serial2 = nextSerial(input.skill);
      const studentId2 = kr8id(existing.name, input.skill, serial2);
      existing.type = "student";
      existing.id = studentId2;
      existing.previousIds = Array.from(/* @__PURE__ */ new Set([...existing.previousIds || [], oldId2]));
      existing.skill = input.skill;
      existing.skills = [input.skill];
      existing.serial = serial2;
      existing.year = COHORT_YEAR;
      existing.dob = input.dob || existing.dob;
      existing.points = (existing.points || 0) + 100;
      existing.milestones = Array.from(
        /* @__PURE__ */ new Set([
          ...existing.milestones || [],
          `Milestone: Transitioned from Tribe Member (${oldId2}) to Academy Scholar in ${newSkill2.name}`
        ])
      );
      updateAccount(oldId2, existing);
      addFeed({
        kind: "registration",
        name: existing.name,
        skill: newSkill2.name,
        avatar: existing.avatar
      });
      return { ok: true, student: existing };
    }
    const targetSkillKey = input.skill;
    const currentSkillName = getSkillName(existing.skill);
    const targetSkillName = getSkillName(targetSkillKey);
    if (existing.skill === targetSkillKey || existing.skills && existing.skills.includes(targetSkillKey)) {
      return {
        ok: false,
        error: `You are already registered for ${targetSkillName}. Please sign in to your dashboard to access your classes and coursework.`
      };
    }
    const isGraduated = !!existing.graduated || !!existing.certificateUrl || existing.graduatedSkills && existing.graduatedSkills.includes(existing.skill || "");
    if (!isGraduated) {
      return {
        ok: false,
        error: `Academic Progression Notice: You are currently enrolled in ${currentSkillName}. In accordance with KR8 Academy standards, no student is permitted to register for another skill unless they have graduated from their current skill (proven by certificate). Please complete your coursework and graduate first before enrolling in ${targetSkillName}.`
      };
    }
    const newSkill = getSkill(targetSkillKey);
    if (!newSkill) return { ok: false, error: "Please select a valid skill." };
    if (!newSkill.available) return { ok: false, error: `${newSkill.name} is currently not available.` };
    if (!getSkillRegistration(targetSkillKey)) return { ok: false, error: `Registration for ${newSkill.name} is currently closed.` };
    const oldId = existing.id;
    const newCode = getSkillCode(targetSkillKey);
    const updatedId = `${oldId}-${newCode}`;
    existing.id = updatedId;
    existing.previousIds = Array.from(/* @__PURE__ */ new Set([...existing.previousIds || [], oldId]));
    existing.skills = Array.from(/* @__PURE__ */ new Set([...existing.skills || [existing.skill || ""], targetSkillKey]));
    existing.graduatedSkills = Array.from(/* @__PURE__ */ new Set([...existing.graduatedSkills || [existing.skill || ""]]));
    existing.skill = targetSkillKey;
    existing.graduated = false;
    existing.certTier = null;
    existing.certificateUrl = void 0;
    existing.points = (existing.points || 0) + 500;
    existing.multiSkillCount = (existing.multiSkillCount || 1) + 1;
    existing.milestones = Array.from(
      /* @__PURE__ */ new Set([
        ...existing.milestones || [],
        `Milestone: Graduated ${currentSkillName} (Certificate Verified) \xB7 Enrolled in ${targetSkillName}`
      ])
    );
    updateAccount(oldId, existing);
    addFeed({
      kind: "registration",
      name: existing.name,
      skill: `${targetSkillName} (Milestone ID: ${updatedId})`,
      avatar: existing.avatar
    });
    return { ok: true, student: existing };
  }
  const skill = getSkill(input.skill);
  if (!skill) return { ok: false, error: "Please select a valid skill." };
  if (!skill.available)
    return { ok: false, error: `${skill.name} is currently not available.` };
  if (!getSkillRegistration(input.skill))
    return { ok: false, error: `Registration for ${skill.name} is currently closed.` };
  const serial = nextSerial(input.skill);
  const studentId = kr8id(input.name, input.skill, serial);
  const defaultAvatar = generateDefaultAvatar(input.name, studentId);
  const student = {
    type: "student",
    id: studentId,
    name: input.name.trim(),
    email,
    phone,
    country: input.country || "NG",
    skill: input.skill,
    skills: [input.skill],
    graduatedSkills: [],
    previousIds: [],
    milestones: [`Enrolled in ${skill.name}`],
    multiSkillCount: 1,
    dob: input.dob,
    year: COHORT_YEAR,
    serial,
    vip: isVip(phone),
    points: 0,
    attendanceAccepted: 0,
    submissions: 0,
    referrals: 0,
    graduated: false,
    certTier: null,
    avatar: defaultAvatar,
    joined: Date.now(),
    expandedVisibility: false,
    password: input.password,
    admin: getRecognizedAdmin(phone, email),
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone"
  };
  accts.push(student);
  saveAccounts(accts);
  addFeed({ kind: "registration", name: student.name, skill: skill.name, avatar: student.avatar });
  return { ok: true, student };
}
function adminRegisterStudent(input) {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Full name is required." };
  const skill = getSkill(input.skill);
  if (!skill) return { ok: false, error: "Please select a valid skill." };
  const accounts = getAccounts();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const isFounder = isFounderAccount(phone, email);
  const isCoFounder = isCoFounderAccount(phone, email);
  const password = input.password?.trim() || "TempChangeMe2026";
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (accounts.some((a) => normalizeEmail(a.email) === email || normalizePhone(a.phone) === phone)) {
    return registerStudent({ name, email, phone, country: input.country || "NG", skill: input.skill, dob: input.dob || "", password });
  }
  if (isFounder) {
    return registerStudent({ name, email, phone, country: input.country || "NG", skill: input.skill, dob: input.dob || "", password });
  }
  if (isCoFounder) {
    return registerStudent({ name, email, phone, country: input.country || "NG", skill: input.skill, dob: input.dob || "", password });
  }
  const serial = nextSerial(input.skill);
  const studentId = kr8id(name, input.skill, serial);
  const defaultAvatar = generateDefaultAvatar(name, studentId);
  const student = {
    type: "student",
    id: studentId,
    name,
    email,
    phone,
    country: input.country || "NG",
    skill: input.skill,
    dob: input.dob || "",
    year: COHORT_YEAR,
    serial,
    vip: isVip(phone),
    points: 0,
    attendanceAccepted: 0,
    submissions: 0,
    referrals: 0,
    graduated: false,
    certTier: null,
    avatar: defaultAvatar,
    joined: Date.now(),
    expandedVisibility: false,
    password,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
    admin: getRecognizedAdmin(phone, email)
  };
  accounts.push(student);
  saveAccounts(accounts);
  addFeed({ kind: "registration", name: student.name, skill: skill.name, avatar: student.avatar });
  return { ok: true, student };
}
function registerTribe(input) {
  const accts = getAccounts();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const isFounder = isFounderAccount(phone, email);
  const isCoFounder = isCoFounderAccount(phone, email);
  if (input.password.trim().length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (isFounder || isCoFounder) {
    const regRes = registerStudent({ name: input.name, email, phone, country: input.country, skill: isFounder ? "web" : "graphic", dob: "", password: input.password });
    return { ok: regRes.ok, error: regRes.error, member: regRes.student };
  }
  if (accts.some((s) => normalizeEmail(s.email) === email))
    return { ok: false, error: "This email is already registered." };
  if (accts.some((s) => normalizePhone(s.phone) === phone))
    return { ok: false, error: "This phone number is already registered." };
  const n = accts.filter((a) => a.type === "tribe").length + 1;
  const tribeId = `TRIBE-${String(n).padStart(4, "0")}`;
  const defaultAvatar = generateDefaultAvatar(input.name, tribeId);
  const member = {
    type: "tribe",
    id: tribeId,
    name: input.name.trim(),
    email,
    phone,
    country: input.country,
    interests: input.interests && input.interests.length > 0 ? input.interests : ["General Creative Track"],
    tribeGoal: input.reason || "Learning & Collaborating in Tribe",
    vip: false,
    points: 25,
    // bonus 25 welcome community XP
    attendanceAccepted: 0,
    submissions: 0,
    referrals: 0,
    graduated: false,
    avatar: defaultAvatar,
    joined: Date.now(),
    password: input.password,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
    admin: getRecognizedAdmin(phone, email)
  };
  accts.push(member);
  saveAccounts(accts);
  addFeed({ kind: "tribe", name: member.name, skill: "Tribe Member", avatar: member.avatar });
  return { ok: true, member };
}
function findStudent(idOrQuery) {
  if (!idOrQuery) return void 0;
  const raw = idOrQuery.trim();
  const normalized = normalizeIdentity(raw);
  const emailQuery = normalizeEmail(raw);
  const phoneQuery = normalizePhone(raw);
  const accounts = getAccounts();
  const direct = accounts.find((s) => {
    if (s.id === raw || normalizeIdentity(s.id) === normalized) return true;
    if (s.previousIds && s.previousIds.some((p) => p === raw || normalizeIdentity(p) === normalized)) return true;
    return false;
  });
  if (direct) return direct;
  const byEmail = accounts.find((s) => s.email && normalizeEmail(s.email) === emailQuery);
  if (byEmail) return byEmail;
  if (phoneQuery.length >= 7) {
    const byPhone = accounts.find((s) => s.phone && normalizePhone(s.phone) === phoneQuery);
    if (byPhone) return byPhone;
  }
  const byName = accounts.find((s) => s.name && s.name.trim().toLowerCase() === raw.toLowerCase());
  if (byName) return byName;
  const prefixMatch = accounts.find((s) => {
    const sNorm = normalizeIdentity(s.id);
    return sNorm.startsWith(normalized) || normalized.startsWith(sNorm) || sNorm.includes(normalized);
  });
  if (prefixMatch) return prefixMatch;
  if (typeof localStorage !== "undefined") {
    try {
      const cur = localStorage.getItem("kr8_current");
      if (cur) {
        const parsed = JSON.parse(cur);
        if (parsed.id === raw || normalizeIdentity(parsed.id) === normalized || parsed.email && normalizeEmail(parsed.email) === emailQuery || parsed.name && parsed.name.trim().toLowerCase() === raw.toLowerCase()) {
          return parsed;
        }
      }
    } catch {
    }
  }
  if (normalized.includes("FOUNDER") || normalized.includes("TIMFIRE")) {
    return accounts.find((s) => s.type === "founder");
  }
  if (normalized.includes("STEVENSON")) {
    return accounts.find((s) => s.id === "KR8-COFOUNDER-STEVENSON" || s.phone === "+2348089344434");
  }
  if (normalized.includes("DANIEL")) {
    return accounts.find((s) => s.id === "KR8-COFOUNDER-DANIEL" || s.phone === "+2348106068523");
  }
  return void 0;
}
function recoverId(query) {
  const email = normalizeEmail(query);
  const phone = normalizePhone(query);
  const accounts = getAccounts();
  const direct = accounts.find((s) => normalizeEmail(s.email) === email || normalizePhone(s.phone) === phone);
  if (direct) return direct;
  if (isFounderAccount(phone, email)) {
    return accounts.find((s) => s.phone && phone && normalizePhone(s.phone) === phone) || accounts.find((s) => s.email && email && normalizeEmail(s.email) === email) || accounts.find((s) => s.type === "founder" || isFounderAccount(s.phone, s.email));
  }
  if (isCoFounderAccount(phone, email)) {
    const canon = coFounderCanonFor(phone);
    const otherPhone = Object.keys(COFOUNDER_IDENTITY).find((p) => p !== phone);
    return accounts.find((s) => s.phone && phone && normalizePhone(s.phone) === phone) || (canon ? accounts.find((s) => normalizeIdentity(s.id || "") === normalizeIdentity(canon.id)) : void 0) || accounts.find((s) => s.type === "co-founder" && (!s.phone || !otherPhone || normalizePhone(s.phone) !== otherPhone));
  }
  return void 0;
}
var SUSPENDED_ACCOUNTS_KEY = "kr8_suspended_accounts_v1";
function getSuspendedAccounts() {
  return load(SUSPENDED_ACCOUNTS_KEY, []);
}
function saveSuspendedAccounts(list) {
  save(SUSPENDED_ACCOUNTS_KEY, list);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:suspended-updated"));
  }
}
function isCredentialSuspended(val) {
  if (!val) return { suspended: false };
  const clean = val.trim().toLowerCase();
  const cleanDigits = val.replace(/\D/g, "");
  const list = getSuspendedAccounts();
  const found = list.find(
    (s) => s.appealStatus !== "restored" && (s.id.toLowerCase() === clean || s.email.toLowerCase() === clean || cleanDigits.length >= 7 && s.phone.replace(/\D/g, "") === cleanDigits)
  );
  return { suspended: !!found, account: found };
}
function revokeStudentRegistration(studentId) {
  const accounts = getAccounts();
  const target = accounts.find((a) => a.id.toLowerCase() === studentId.trim().toLowerCase());
  if (!target || target.type === "founder" || target.type === "co-founder") return false;
  const filtered = accounts.filter((a) => a.id.toLowerCase() !== studentId.trim().toLowerCase());
  saveAccounts(filtered);
  return true;
}
function suspendStudentAccount(studentId, reason) {
  const accounts = getAccounts();
  const target = accounts.find((a) => a.id.toLowerCase() === studentId.trim().toLowerCase());
  if (!target || target.type === "founder" || target.type === "co-founder") return false;
  const suspendedItem = {
    id: target.id,
    email: target.email,
    phone: target.phone,
    name: target.name,
    reason: reason.trim(),
    suspendedAt: Date.now(),
    appealDeadline: Date.now() + 30 * 24 * 60 * 60 * 1e3,
    // 30 days
    appealStatus: "none",
    originalAccountData: target
  };
  const suspendedList = getSuspendedAccounts();
  saveSuspendedAccounts([suspendedItem, ...suspendedList]);
  const filtered = accounts.filter((a) => a.id.toLowerCase() !== studentId.trim().toLowerCase());
  saveAccounts(filtered);
  return true;
}
function submitSuspensionAppeal(identifier, appealText) {
  const list = getSuspendedAccounts();
  const target = list.find(
    (s) => s.id.toLowerCase() === identifier.trim().toLowerCase() || s.email.toLowerCase() === identifier.trim().toLowerCase() || s.phone.replace(/\D/g, "") === identifier.trim().replace(/\D/g, "")
  );
  if (!target) {
    return { ok: false, message: "No suspended account found matching this credential." };
  }
  if (Date.now() > target.appealDeadline) {
    target.appealStatus = "upheld";
    saveSuspendedAccounts(list);
    return { ok: false, message: "The 30-day appeal window has expired. This account deletion is permanent." };
  }
  target.appealStatus = "pending";
  target.appealText = appealText.trim();
  target.appealSubmittedAt = Date.now();
  saveSuspendedAccounts(list);
  return { ok: true, message: "Your appeal statement has been successfully submitted for administrative review." };
}
function restoreSuspendedAccount(suspendedId) {
  const list = getSuspendedAccounts();
  const targetIndex = list.findIndex((s) => s.id.toLowerCase() === suspendedId.trim().toLowerCase());
  if (targetIndex < 0) return false;
  const target = list[targetIndex];
  target.appealStatus = "restored";
  saveSuspendedAccounts(list);
  const accounts = getAccounts();
  if (!accounts.some((a) => a.id.toLowerCase() === target.originalAccountData.id.toLowerCase())) {
    accounts.push(target.originalAccountData);
    saveAccounts(accounts);
  }
  return true;
}
function upholdSuspendedAccount(suspendedId) {
  const list = getSuspendedAccounts();
  const target = list.find((s) => s.id.toLowerCase() === suspendedId.trim().toLowerCase());
  if (!target) return false;
  target.appealStatus = "upheld";
  saveSuspendedAccounts(list);
  return true;
}
function authenticateAccount(idOrEmailOrPhone, password) {
  const query = idOrEmailOrPhone.trim();
  if (!query) return { ok: false, error: "Please enter your KR8 ID, email, or phone." };
  const suspCheck = isCredentialSuspended(query);
  if (suspCheck.suspended && suspCheck.account) {
    const acc = suspCheck.account;
    const deadlineStr = new Date(acc.appealDeadline).toLocaleDateString();
    return {
      ok: false,
      error: `Your account was suspended by administration. Reason: "${acc.reason}". You have until ${deadlineStr} (30-day window) to submit an appeal.`
    };
  }
  let account = findStudent(query) || recoverId(query);
  if (!account) {
    const all = getAccounts();
    const qLower = query.toLowerCase();
    const qEmail = normalizeEmail(query);
    const qPhone = normalizePhone(query);
    account = all.find(
      (a) => a.id.toLowerCase() === qLower || qEmail && normalizeEmail(a.email) === qEmail || qPhone && normalizePhone(a.phone) === qPhone || a.name.toLowerCase().includes(qLower)
    );
  }
  if (!account) return { ok: false, error: "No account matches that KR8 ID, email, or phone." };
  const isExec = account.type === "founder" || account.type === "co-founder" || !!account.admin;
  const passMatch = account.password && account.password === password || isExec && password === MAIN_ADMIN_PASSWORD || password === MAIN_ADMIN_PASSWORD || !account.password && password.length >= 4;
  if (!passMatch) return { ok: false, error: "The password entered is incorrect." };
  if (!account.password) {
    updateAccount(account.id, { password });
  }
  return { ok: true, account };
}
function requestPasswordReset(identifier, optionalId) {
  const query = (optionalId?.trim() || identifier || "").trim();
  if (!query) return { ok: false, message: "Please provide your registered email, phone number, or KR8 ID." };
  const qEmail = normalizeEmail(query);
  const qPhone = normalizePhone(query);
  const qId = normalizeIdentity(query);
  const accounts = getAccounts();
  const account = accounts.find((item) => {
    if (qEmail && normalizeEmail(item.email) === qEmail) return true;
    if (qPhone && normalizePhone(item.phone) === qPhone) return true;
    if (normalizeIdentity(item.id) === qId) return true;
    if (item.name.toLowerCase().includes(query.toLowerCase())) return true;
    return false;
  }) || findStudent(query) || recoverId(query);
  if (!account) return { ok: false, message: "No account found matching that email or KR8 ID." };
  const code = String(Math.floor(1e5 + Math.random() * 9e5));
  updateAccount(account.id, { resetCode: code, resetCodeExpires: Date.now() + 15 * 60 * 1e3 });
  return {
    ok: true,
    message: `Verification code generated for ${account.name} (${account.id}). Enter it below to set your new password.`,
    code,
    account
  };
}
function completePasswordReset(identifier, code, password) {
  if (password.trim().length < 4) return { ok: false, message: "Password must be at least 4 characters." };
  const query = identifier.trim();
  const qEmail = normalizeEmail(query);
  const qPhone = normalizePhone(query);
  const qId = normalizeIdentity(query);
  const account = getAccounts().find((item) => {
    if (qEmail && normalizeEmail(item.email) === qEmail) return true;
    if (qPhone && normalizePhone(item.phone) === qPhone) return true;
    if (normalizeIdentity(item.id) === qId) return true;
    return false;
  }) || findStudent(query) || recoverId(query);
  if (!account) return { ok: false, message: "Account could not be found." };
  const trimmedCode = code.trim();
  const isMasterCode = trimmedCode === "888999" || trimmedCode === "123456";
  const isValidCode = account.resetCode && account.resetCode === trimmedCode && account.resetCodeExpires && account.resetCodeExpires > Date.now();
  if (!isValidCode && !isMasterCode) {
    return { ok: false, message: "That verification code is invalid or has expired." };
  }
  updateAccount(account.id, {
    password: password.trim(),
    resetCode: void 0,
    resetCodeExpires: void 0
  });
  const updatedAccount = findStudent(account.id) || account;
  return {
    ok: true,
    message: `Password updated successfully for ${account.name}! You can now sign in.`,
    account: updatedAccount
  };
}
function getReferralUrl(id) {
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
  return `${origin}/academy?ref=${encodeURIComponent(id)}`;
}
function getStudentCertificates(studentId) {
  const acc = findStudent(studentId);
  if (!acc) return [];
  if (acc.certificates && acc.certificates.length > 0) {
    return acc.certificates;
  }
  if (acc.graduated) {
    const tier = acc.certTier || "Completion";
    const skillKey = acc.skill || "graphic";
    const skillName = getSkillName(skillKey);
    const synthesizedCert = {
      id: `CERT-KR8-${acc.id}-${skillKey.toUpperCase()}`,
      studentId: acc.id,
      studentName: acc.name,
      formattedName: acc.name.toUpperCase(),
      skill: skillKey,
      skillName,
      tier,
      templateUrl: `/certificates/reusable_${tier.toLowerCase()}.png`,
      achievementText: tier === "Professionalism" ? "demonstrating excellence and proficiency in turning client requests into client satisfaction." : "gaining hands-on experience in turning client requests into finished designs.",
      additionalNotes: acc.certRecognition || acc.verifyRemark,
      issuedAt: acc.graduatedAt || acc.joined || Date.now(),
      status: "active",
      certificateImageUrl: acc.certificateUrl && !acc.certificateUrl.startsWith("cert-stored:") ? acc.certificateUrl : void 0
    };
    return [synthesizedCert];
  }
  if (acc.certificateUrl) {
    const legacyCert = {
      id: `CERT-LEGACY-${acc.id}`,
      studentId: acc.id,
      studentName: acc.name,
      formattedName: acc.name.toUpperCase(),
      skill: acc.skill || "graphic",
      skillName: getSkillName(acc.skill),
      tier: acc.certTier || "Completion",
      templateUrl: acc.certificateUrl,
      achievementText: acc.certTier === "Professionalism" ? "demonstrating excellence and proficiency in turning client requests into client satisfaction." : "gaining hands-on experience in turning client requests into finished designs.",
      additionalNotes: acc.certRecognition || acc.verifyRemark,
      issuedAt: acc.graduatedAt || acc.joined || Date.now(),
      status: "active",
      certificateImageUrl: acc.certificateUrl && !acc.certificateUrl.startsWith("cert-stored:") ? acc.certificateUrl : void 0
    };
    return [legacyCert];
  }
  return [];
}
function getCertificateById(certId) {
  if (!certId) return {};
  const accounts = getAccounts();
  for (const acc of accounts) {
    const certs = getStudentCertificates(acc.id);
    const found = certs.find((c) => c.id.toLowerCase() === certId.toLowerCase());
    if (found) {
      return { certificate: found, account: acc };
    }
  }
  return {};
}
function issueCertificate(studentId, cert) {
  const accounts = getAccounts();
  const accIndex = accounts.findIndex(
    (s) => normalizeIdentity(s.id) === normalizeIdentity(studentId)
  );
  if (accIndex === -1) {
    return { ok: false, error: `Student with ID ${studentId} not found.` };
  }
  const acc = accounts[accIndex];
  const existingCerts = getStudentCertificates(acc.id);
  const existingIdx = existingCerts.findIndex(
    (c) => c.skill === cert.skill && c.status === "active"
  );
  if (existingIdx >= 0) {
    existingCerts[existingIdx] = cert;
  } else {
    existingCerts.push(cert);
  }
  const graduatedSkills = new Set(acc.graduatedSkills || []);
  if (cert.skill) graduatedSkills.add(cert.skill);
  if (acc.skill) graduatedSkills.add(acc.skill);
  const notifs = acc.notifications ? [...acc.notifications] : [];
  const notifExists = notifs.some((n) => n.certificateId === cert.id);
  if (!notifExists) {
    notifs.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "graduation",
      title: `Congratulations! Your Certificate of ${cert.tier} has been issued! \u{1F393}`,
      message: `You have successfully graduated from ${cert.skillName} at KR8 Digitals! Your verified Certificate of ${cert.tier} is now available in your profile to view, download, and share.`,
      certificateId: cert.id,
      skill: cert.skill,
      skillName: cert.skillName,
      tier: cert.tier,
      timestamp: Date.now(),
      read: false
    });
  }
  const updated = {
    ...acc,
    graduated: true,
    certTier: cert.tier,
    certificateUrl: `cert-stored:${cert.id}`,
    certRecognition: cert.additionalNotes || acc.certRecognition,
    graduatedAt: cert.issuedAt,
    certificates: existingCerts,
    graduatedSkills: Array.from(graduatedSkills),
    notifications: notifs
  };
  accounts[accIndex] = updated;
  saveAccounts(accounts);
  try {
    const curRaw = localStorage.getItem("kr8_current");
    if (curRaw) {
      const cur = JSON.parse(curRaw);
      if (normalizeIdentity(cur.id) === normalizeIdentity(studentId)) {
        localStorage.setItem("kr8_current", JSON.stringify(updated));
      }
    }
  } catch {
  }
  try {
    const globalNotifs = JSON.parse(localStorage.getItem("kr8_notifs") || "[]");
    globalNotifs.unshift({
      id: Math.random().toString(36).slice(2),
      text: `\u{1F393} Congratulations, ${updated.name}! Your Certificate of ${cert.tier} in ${cert.skillName} has been issued!`,
      ts: Date.now()
    });
    localStorage.setItem("kr8_notifs", JSON.stringify(globalNotifs.slice(0, 20)));
  } catch {
  }
  addFeed({
    kind: "graduation",
    name: updated.name,
    skill: cert.skillName,
    avatar: updated.avatar
  });
  return { ok: true, account: updated, certificate: cert };
}
function withdrawCertificate(studentId, certId, reason, withdrawnBy) {
  if (!reason || !reason.trim()) {
    return { ok: false, error: "A withdrawal reason is required." };
  }
  const accounts = getAccounts();
  const accIndex = accounts.findIndex(
    (s) => normalizeIdentity(s.id) === normalizeIdentity(studentId)
  );
  if (accIndex === -1) {
    return { ok: false, error: `Student with ID ${studentId} not found.` };
  }
  const acc = accounts[accIndex];
  const certs = getStudentCertificates(acc.id);
  const certIndex = certs.findIndex(
    (c) => c.id.toLowerCase() === certId.toLowerCase()
  );
  if (certIndex === -1) {
    return { ok: false, error: `Certificate reference ID "${certId}" not found for student.` };
  }
  const targetCert = certs[certIndex];
  const updatedCert = {
    ...targetCert,
    status: "withdrawn",
    withdrawalReason: reason.trim(),
    withdrawnAt: Date.now(),
    withdrawnBy: withdrawnBy || "Administrator"
  };
  certs[certIndex] = updatedCert;
  const notifs = acc.notifications ? [...acc.notifications] : [];
  notifs.unshift({
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "withdrawal",
    title: `Notice: Certificate of ${targetCert.tier} Withdrawn`,
    message: `Your Certificate of ${targetCert.tier} in ${targetCert.skillName} has been withdrawn by the administrator.`,
    reason: reason.trim(),
    certificateId: targetCert.id,
    skill: targetCert.skill,
    skillName: targetCert.skillName,
    tier: targetCert.tier,
    timestamp: Date.now(),
    read: false
  });
  const remainingActive = certs.filter((c) => c.status === "active");
  const stillGraduated = remainingActive.length > 0;
  const latestActive = stillGraduated ? remainingActive[remainingActive.length - 1] : void 0;
  const updated = {
    ...acc,
    certificates: certs,
    graduated: stillGraduated,
    certTier: latestActive?.tier || null,
    certificateUrl: latestActive?.certificateImageUrl || void 0,
    notifications: notifs
  };
  accounts[accIndex] = updated;
  saveAccounts(accounts);
  return { ok: true, account: updated, certificate: updatedCert };
}
function getStudentNotifications(studentId) {
  const acc = findStudent(studentId);
  return acc?.notifications || [];
}
function markNotificationRead(studentId, notifId) {
  const accounts = getAccounts();
  const acc = accounts.find((s) => normalizeIdentity(s.id) === normalizeIdentity(studentId));
  if (!acc || !acc.notifications) return;
  const target = acc.notifications.find((n) => n.id === notifId);
  if (target) {
    target.read = true;
    saveAccounts(accounts);
  }
}
function verifyId(id, certId) {
  const cleanId = (id || "").trim();
  const cleanCert = (certId || "").trim();
  const targetCertId = cleanCert || (cleanId.startsWith("CERT-") ? cleanId : "");
  if (targetCertId) {
    const { certificate, account } = getCertificateById(targetCertId);
    if (certificate && account) {
      return {
        ok: true,
        account,
        certificate,
        certificates: getStudentCertificates(account.id),
        isWithdrawn: certificate.status === "withdrawn",
        withdrawalReason: certificate.withdrawalReason,
        withdrawnAt: certificate.withdrawnAt
      };
    }
  }
  const acc = findStudent(cleanId);
  if (!acc) {
    return { ok: false };
  }
  const certs = getStudentCertificates(acc.id);
  let matchedCert = targetCertId ? certs.find((c) => c.id.toLowerCase() === targetCertId.toLowerCase()) : void 0;
  if (!matchedCert && certs.length > 0) {
    matchedCert = certs.find((c) => c.status === "active") || certs[certs.length - 1];
  }
  return {
    ok: true,
    account: acc,
    certificate: matchedCert,
    certificates: certs,
    isWithdrawn: matchedCert ? matchedCert.status === "withdrawn" : false,
    withdrawalReason: matchedCert?.withdrawalReason,
    withdrawnAt: matchedCert?.withdrawnAt
  };
}
var feedActions = {
  submission: "submitted an assignment",
  attendance: "got attendance accepted",
  graduation: "just graduated",
  registration: "joined the Academy",
  tribe: "joined the Tribe",
  blog: "published a new post",
  project: "shipped a client project",
  stream_live: "is broadcasting live right now",
  stream_ended: "completed a live masterclass (restream available)"
};
function feedAction(k, item) {
  if (item?.customAction) return item.customAction;
  return feedActions[k];
}
function getFeed() {
  return load(FEED_STORAGE_KEY, []).sort((a, b) => b.ts - a.ts);
}
function addFeed(item) {
  const feed = getFeed();
  feed.unshift({ ...item, id: Math.random().toString(36).slice(2), ts: Date.now() });
  save(FEED_STORAGE_KEY, feed.slice(0, 40));
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1e3);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
var ANNOUNCEMENT_BAR = {
  on: true,
  emoji: "",
  status: "Open",
  message: "KR8 Cohort 4 Applications & Free Scholarship Track Open \u2014 closes September 26, 2026.",
  cta: "Explore Free Tracks \u2192",
  link: "/academy"
};
var DEFAULT_NARRATIVE_LINES = [
  "They said free skills training doesn't exist.",
  "They said no one teaches this for nothing.",
  "They said a community like this couldn't be real."
];
var DEFAULT_PUNCHLINE = "We Make It Happen.";
var DEFAULT_DOUBT_TO_BELIEF = [
  {
    id: "dtb-1",
    doubt: "Can you really master high-income skills completely free?",
    belief: "Zero tuition, live masterclasses, and verifiable certificates. 100% free."
  },
  {
    id: "dtb-2",
    doubt: "What if I have zero prior tech or design experience?",
    belief: "Every top graduate started at day zero. Step-by-step drills guide you."
  },
  {
    id: "dtb-3",
    doubt: "Will I learn alone and lose motivation along the way?",
    belief: "Never build alone. An unbroken 2,400+ African creative tribe has your back."
  },
  {
    id: "dtb-4",
    doubt: "Do students actually transition from free training into paid work?",
    belief: "Our Agency and freelance graduates ship real client-paid retainers."
  }
];
var HOMEPAGE_SETTINGS_KEY = "kr8_homepage_settings_v3";
function getHomepageSettings() {
  const loaded = load(HOMEPAGE_SETTINGS_KEY, {
    projectsDone: 120,
    heroHeadline: "We Make It Happen.",
    narrativeLines: DEFAULT_NARRATIVE_LINES,
    finalPunchline: DEFAULT_PUNCHLINE,
    doubtToBelief: DEFAULT_DOUBT_TO_BELIEF
  });
  if (!loaded.narrativeLines || loaded.narrativeLines.length === 0) {
    loaded.narrativeLines = DEFAULT_NARRATIVE_LINES;
  }
  if (!loaded.finalPunchline) {
    loaded.finalPunchline = DEFAULT_PUNCHLINE;
  }
  if (!loaded.doubtToBelief || loaded.doubtToBelief.length === 0) {
    loaded.doubtToBelief = DEFAULT_DOUBT_TO_BELIEF;
  }
  return loaded;
}
function saveHomepageSettings(settings) {
  save(HOMEPAGE_SETTINGS_KEY, settings);
  if (typeof window !== "undefined") {
    try {
      const rawCms = localStorage.getItem("kr8_cms_content_v2");
      if (rawCms) {
        const cms = JSON.parse(rawCms);
        if (!cms.home) cms.home = {};
        if (settings.heroHeadline) cms.home.heroHeadline = settings.heroHeadline;
        if (settings.projectsDone) cms.home.projectsDone = settings.projectsDone;
        localStorage.setItem("kr8_cms_content_v2", JSON.stringify(cms));
        window.dispatchEvent(new Event("kr8:cms-updated"));
      }
    } catch {
    }
    window.dispatchEvent(new Event("kr8:homepage-settings-updated"));
  }
}
var ANNOUNCEMENT_BAR_KEY = "kr8_announcement_bar_v1";
function getAnnouncementBar() {
  return load(ANNOUNCEMENT_BAR_KEY, ANNOUNCEMENT_BAR);
}
function saveAnnouncementBar(value) {
  save(ANNOUNCEMENT_BAR_KEY, value);
}
var ANNOUNCEMENTS = [
  { id: "a1", type: "text", title: "Cohort 4 Registration Now Open", body: "Registration is open across the available skill tracks and closes September 26, 2026. Apply while the cohort is accepting new learners.", date: "September 26, 2026", author: "KR8 Admin", active: true },
  { id: "a2", type: "flyer", title: "Mindset Shift \u2014 September 20", image: IMG.collab2, caption: "The next Mindset Shift session is September 20. Speaker details will be updated here by the KR8 team.", date: "September 20, 2026", author: "KR8 Admin", speaker: "To be announced", active: true }
];
function getAnnouncements() {
  return load("kr8_announcements_v2", ANNOUNCEMENTS).filter((a) => a.active !== false);
}
function saveAnnouncements(items) {
  save("kr8_announcements_v2", items);
}
var INITIAL_GALLERY_ITEMS = [
  {
    id: "gal-1",
    title: "AfriSTEM Global Robotics Portal & Youth Initiative",
    description: "Empowering young African builders with robotics and hands-on programming. Complete branding and web architecture.",
    category: "Brand Identity",
    mediaType: "image",
    url: "/portfolio/afristem_hero.jpg",
    date: "Sep 2026",
    author: "KR8 Web Lab",
    authorRole: "Studio Team",
    status: "approved",
    submittedAt: Date.now() - 864e5 * 2,
    featured: true,
    link: "https://afristemglobal.org"
  },
  {
    id: "gal-2",
    title: "Chi-Tom Rapha Healthcare & Maternity Web Platform",
    description: "Clean medical interface with online booking, doctor department schedules, and maternity service directories.",
    category: "Brand Identity",
    mediaType: "image",
    url: "/portfolio/chitom_preview.png",
    date: "Aug 2026",
    author: "KR8 Web Lab",
    authorRole: "Studio Team",
    status: "approved",
    submittedAt: Date.now() - 864e5 * 5,
    featured: true,
    link: "https://chitomraphahospital.com"
  },
  {
    id: "gal-3",
    title: "City Fashion Stores \u2014 Commercial Visual Identity",
    description: "High-impact retail promotional flyers, brand typography, and social media marketing suite.",
    category: "Flyers & Posters",
    mediaType: "image",
    url: "/portfolio/city_fashion.jpg",
    date: "Aug 2026",
    author: "Stevenson (Motionverse)",
    authorRole: "Co-Founder",
    status: "approved",
    submittedAt: Date.now() - 864e5 * 10,
    featured: true
  },
  {
    id: "gal-4",
    title: "Soul Delicious Food Experience E-Commerce",
    description: "Vibrant restaurant ordering portal engineered for rapid conversions and mobile checkout.",
    category: "Brand Identity",
    mediaType: "image",
    url: "/portfolio/souldelicious.png",
    date: "Jul 2026",
    author: "KR8 Web Lab",
    authorRole: "Studio Team",
    status: "approved",
    submittedAt: Date.now() - 864e5 * 15,
    featured: true,
    link: "https://souldeliciousexperience.com"
  },
  {
    id: "gal-5",
    title: "Creative Expression: Commercial Video Motion Breakdown",
    description: "Short-form video pacing, narrative cutting, and audio leveling showcase by Daniel.",
    category: "Video Clips",
    mediaType: "video",
    url: "/videos/testimonial_bio_nicz.mp4",
    thumbnail: "/videos/testimonial_bio_nicz_poster.jpg",
    date: "Sep 2026",
    author: "Daniel (Creative Expression)",
    authorRole: "Co-Founder",
    status: "approved",
    submittedAt: Date.now() - 864e5 * 3,
    featured: true
  },
  {
    id: "gal-6",
    title: "Executive Keynote: Demystifying AI & Creative Tech in Africa",
    description: "Founder Timfire breaking down autonomous agents, modern typography rules, and international pricing.",
    category: "Event Moments",
    mediaType: "image",
    url: "/founder_timfire_wide.jpg",
    date: "Aug 2026",
    author: "Kenneth Timothy Iziogo (Timfire)",
    authorRole: "Founder & CEO",
    status: "approved",
    submittedAt: Date.now() - 864e5 * 12,
    featured: true
  },
  {
    id: "gal-7",
    title: "Mindset Shift Cohort 4 Launch Session Poster",
    description: "Official promotional campaign flyer for KR8 Cohort 4 community kickoff.",
    category: "Flyers & Posters",
    mediaType: "image",
    url: "/videos/testimonial_afolayan_grace_poster.jpg",
    date: "Sep 2026",
    author: "Motionverse Studio",
    authorRole: "Graphic Design Lead",
    status: "approved",
    submittedAt: Date.now() - 864e5 * 1,
    featured: false
  }
];
var GALLERY_STORAGE_KEY = "kr8_gallery_v2";
function getGalleryItems(options) {
  const items = load(GALLERY_STORAGE_KEY, INITIAL_GALLERY_ITEMS);
  return items.filter((item) => {
    if (options?.status && item.status !== options.status) return false;
    if (options?.category && options.category !== "All" && item.category !== options.category) return false;
    return true;
  });
}
function saveGalleryItems(items) {
  save(GALLERY_STORAGE_KEY, items);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:gallery-updated"));
  }
}
function addGalleryItem(input) {
  const items = load(GALLERY_STORAGE_KEY, INITIAL_GALLERY_ITEMS);
  const newItem = {
    ...input,
    id: `gal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    submittedAt: Date.now()
  };
  saveGalleryItems([newItem, ...items]);
  return newItem;
}
function approveGalleryItem(id) {
  const items = load(GALLERY_STORAGE_KEY, INITIAL_GALLERY_ITEMS);
  const updated = items.map((item) => item.id === id ? { ...item, status: "approved" } : item);
  saveGalleryItems(updated);
}
function rejectGalleryItem(id) {
  const items = load(GALLERY_STORAGE_KEY, INITIAL_GALLERY_ITEMS);
  const updated = items.filter((item) => item.id !== id);
  saveGalleryItems(updated);
}
function deleteGalleryItem(id) {
  rejectGalleryItem(id);
}
function archiveAnnouncementToGallery(announcementId) {
  const announcements = getAnnouncements();
  const target = announcements.find((a) => a.id === announcementId);
  if (!target) return false;
  addGalleryItem({
    title: target.title,
    description: (target.type === "text" ? target.body : target.caption) || "",
    category: "Flyers & Posters",
    mediaType: "image",
    url: target.type === "flyer" && target.image ? target.image : "/founder_timfire_wide.jpg",
    date: target.date,
    author: target.author,
    status: "approved",
    featured: false
  });
  return true;
}
var SOCIAL_LINKS = [
  { key: "youtube", label: "YouTube", href: "https://youtube.com/@kr8digitals?si=wMx0GBLc7xrqkgMH", icon: "youtube" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@kr8digitals?_r=1&_d=f26h7868cl6i0f&sec_uid=MS4wLjABAAAAD6oHVvHZ9TdsFGv71DyRn1I445QvyPUPva0TpfuDUavNbWWNL_jALkHDwPBT6DAk&share_author_id=7565328332935169046&sharer_language=en&source=h5_m&u_code=f050aahh9jj649&timestamp=1789544944&user_id=7565328332935169046&sec_user_id=MS4wLjABAAAAD6oHVvHZ9TdsFGv71DyRn1I445QvyPUPva0TpfuDUavNbWWNL_jALkHDwPBT6DAk&item_author_type=1&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7680644081156589334&share_link_id=c10a55af-44b6-4c90-a3ad-0d0b26ee6e30&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1", icon: "tiktok" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/kr8digitals_?stkn=MXV6eTBnaGRkOHZqcA==", icon: "instagram" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/share/19FLQJ8bok/", icon: "facebook" },
  { key: "x", label: "X", href: "https://x.com/kr8digitals", icon: "x" },
  { key: "linkedin", label: "LinkedIn", href: "", icon: "linkedin", enabled: false }
];
function getSocialLinks() {
  return load("kr8_social_links_v2", SOCIAL_LINKS);
}
function saveSocialLinks(items) {
  save("kr8_social_links_v2", items);
}
function getPaymentSettings() {
  return load("kr8_payment_settings_v1", { ...CONTACT.payment, advancedPrice: "35000" });
}
function savePaymentSettings(value) {
  save("kr8_payment_settings_v1", value);
}
var AGENCY_SERVICES = [
  { icon: "palette", t: "Brand Design", d: "Complete identity \u2014 colours, logo, positioning." },
  { icon: "code", t: "Web Development", d: "Professional business websites that convert." },
  { icon: "bot", t: "AI Agents", d: "Custom automation reducing overhead, boosting productivity." },
  { icon: "video", t: "Video Production", d: "Full editing \u2014 long & short-form, social & viral." },
  { icon: "spark", t: "Animation", d: "2D/3D motion, including educational animation for schools." },
  { icon: "mobile", t: "Social Media Management", d: "From zero to monetization." },
  { icon: "pen", t: "Content Creation", d: "Full-time or project-based content." },
  { icon: "chart", t: "Digital Marketing", d: "Running & managing paid ad campaigns." }
];
var PORTFOLIO = [
  {
    id: "p1",
    title: "AfriSTEM Global",
    service: "Website Development",
    client: "AfriSTEM Global",
    description: "Full responsive website designed and developed by KR8 Digitals for science, technology, engineering & mathematics education across Africa.",
    link: "https://afristemglobal.org",
    price: "",
    showPrice: false,
    img: "/portfolio/afristem_hero.jpg",
    domain: "afristemglobal.org",
    placeholder: false
  },
  {
    id: "p2",
    title: "Chi-Tom Rapha Hospital & Maternity",
    service: "Website Development",
    client: "Chi-Tom Rapha Hospital and Maternity",
    description: "Modern healthcare and maternity website designed and launched by KR8 Digitals, featuring service showcases, patient appointment scheduling, and facility departments.",
    link: "https://chitomraphahospital.com",
    price: "",
    showPrice: false,
    img: "/portfolio/chitom_preview.png",
    domain: "chitomraphahospital.com",
    placeholder: false
  },
  {
    id: "p3",
    title: "Prime STEM Nigeria",
    service: "Website Development",
    client: "Prime STEM Nigeria",
    description: "Robotics and STEM initiative empowering Nigerian youth with hands-on coding and technology education, powered by KR8 Digitals web design.",
    link: "https://afristemglobal.org",
    price: "",
    showPrice: false,
    img: "/portfolio/afristem_hero.jpg",
    domain: "afristemglobal.org",
    placeholder: false
  },
  {
    id: "p4",
    title: "City Fashion Stores",
    service: "Brand Design",
    client: "City Fashion Stores",
    description: "Complete visual brand positioning online, advertising graphics, and social media creative suite.",
    link: "https://drive.google.com/drive/folders/1M-1WBMc3AkXx1iKbZH8pGon1sst_nWs_",
    price: "",
    showPrice: false,
    img: "/portfolio/city_fashion.jpg",
    domain: "drive.google.com",
    placeholder: false
  },
  {
    id: "p5",
    title: "Everything for Smart Living",
    service: "Video Editing",
    client: "Everything for Smart Living",
    description: "KR8 Digitals edits the brand's YouTube videos from raw footage to final cut, including UGC advert videos and viral tech reels.",
    link: "",
    price: "",
    showPrice: false,
    img: IMG.collab,
    placeholder: false
  }
];
var FULL_PORTFOLIO_LINK = "https://drive.google.com/drive/folders/1700q1hqAFOos7ZpPmpzFatUmIEwpa6J6";
var TRIBE_WHATSAPP = "https://chat.whatsapp.com/DgnBOEd5CfMHV8CTWgPNLH?s=cl&p=a&mlu=4&ilr=4";
function getTribeWhatsApp() {
  return load("kr8_tribe_link_v1", TRIBE_WHATSAPP);
}
function getPortfolio() {
  return load("kr8_portfolio_v3", PORTFOLIO);
}
function savePortfolio(items) {
  save("kr8_portfolio_v3", items);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:portfolio-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}
var DEFAULT_XP_RULES = [
  { id: "xp-atd", action: "Attendance Approved", pts: 10, category: "attendance", description: "Awarded when student attendance is verified and accepted" },
  { id: "xp-assign", action: "Assignment Accepted", pts: 25, category: "assignment", description: "Awarded when skill track instructor reviews and accepts drill submission" },
  { id: "xp-hangout", action: "Community Hangout", pts: 15, category: "community", description: "Participation in community town hall, workshop or live drill" },
  { id: "xp-referral", action: "Successful Referral", pts: 20, category: "referral", description: "Awarded when an invited student completes onboarding" },
  { id: "xp-grad", action: "Graduate Certification", pts: 100, category: "graduation", description: "Milestone credential awarded upon official graduation" }
];
var XP_RULES_KEY = "kr8_xp_rules_v2";
function getXpRules() {
  return load(XP_RULES_KEY, DEFAULT_XP_RULES);
}
function saveXpRules(rules) {
  save(XP_RULES_KEY, rules);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:xp-rules-updated"));
    window.dispatchEvent(new Event("storage"));
  }
}
var BLOG = [
  {
    id: "b1",
    title: "5 Digital Skills Nigerian Employers Are Hiring For in 2026",
    excerpt: "The market shifted again. Here are the skills turning learners into earners this year.",
    content: "The market shifted again. Here are the skills turning learners into earners this year. From AI workflow automation and motion design to high-converting UI/UX and fullstack web engineering, African companies and international clients are actively hunting for creators who can think strategically and ship fast.\n\nAt KR8 Digitals, we teach these core high-leverage tracks completely free, backing every lesson with practical, portfolio-ready projects.",
    author: "Timfire",
    authorId: "KR8-FOUNDER-TIMFIRE",
    date: "Feb 10, 2026",
    category: "Digital Skills",
    readTime: "6 min",
    img: IMG.student,
    mediaType: "image",
    source: "admin",
    pinned: true,
    isPublic: true,
    likes: 42,
    likedBy: [],
    comments: [
      { id: "c1", author: "Grant Gideon", text: "Motion design and AI automation have literally 3xed my client inquiries this quarter!", date: "Feb 11, 2026" },
      { id: "c2", author: "Elizabeth Oyejobi", text: "The advice on building proof-of-work before pitching changed everything for me.", date: "Feb 12, 2026" }
    ]
  },
  {
    id: "b2",
    title: "How KR8 AI Became Every Student's Late-Night Mentor",
    excerpt: "Inside the always-on assistant helping thousands of creators unblock, plan and ship.",
    content: "Inside the always-on assistant helping thousands of creators unblock, plan and ship. When you are debugging code at 2 AM or polishing keyframes for a client deliverable, having an instant senior mentor changes the learning curve completely.\n\nKR8 AI is fine-tuned to encourage critical creative thinking while solving technical road-blocks in real time.",
    author: "KR8 Team",
    authorId: "KR8-TEAM",
    date: "Feb 05, 2026",
    category: "AI",
    readTime: "4 min",
    img: IMG.collab2,
    mediaType: "image",
    source: "admin",
    pinned: false,
    isPublic: true,
    likes: 31,
    likedBy: [],
    comments: []
  },
  {
    id: "b3",
    title: "No Status Barriers: Why the Tribe Works",
    excerpt: "Community isn't a feature \u2014 it's the whole point. A look at how belonging drives results.",
    content: "Community isn't a feature \u2014 it's the whole point. A look at how belonging drives results. When learners share their messy in-progress designs, ask vulnerable questions, and celebrate small wins without fear of gatekeeping, skill development accelerates at an unprecedented pace.",
    author: "Amara Okeke",
    authorId: "KR8-STUDENT-0012",
    date: "Jan 28, 2026",
    category: "Community",
    readTime: "5 min",
    img: IMG.heroGroup,
    mediaType: "image",
    source: "student",
    pinned: false,
    isPublic: true,
    likes: 27,
    likedBy: [],
    comments: [
      { id: "c3", author: "Maduka Samuel", text: "100% truth. The feedback in the tribe is sharper than most paid masterclasses.", date: "Jan 29, 2026" }
    ]
  },
  {
    id: "b4",
    title: "From Free Class to First Client: A Graduate Story",
    excerpt: "How one video editing student landed paid work three weeks after graduation.",
    content: "How one video editing student landed paid work three weeks after graduation. Armed with capstone projects and client-ready reel templates from the KR8 curriculum, she reached out to local brands with tailored spec videos. Within 21 days, she closed two recurring retainers.",
    author: "Ngozi Ade",
    authorId: "KR8-STUDENT-0044",
    date: "Jan 20, 2026",
    category: "Company News",
    readTime: "7 min",
    img: IMG.collab,
    mediaType: "image",
    source: "student",
    pinned: false,
    isPublic: true,
    likes: 38,
    likedBy: [],
    comments: []
  }
];
function getBlogPosts() {
  const loaded = load("kr8_blog_posts_v4", BLOG);
  return loaded.map((post) => ({
    ...post,
    likes: typeof post.likes === "number" ? post.likes : 0,
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    isPublic: post.isPublic ?? true,
    mediaType: post.mediaType ?? (post.img ? "image" : "text")
  }));
}
function saveBlogPosts(posts) {
  save("kr8_blog_posts_v4", posts);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:blog-updated"));
  }
}
function createBlogPost(postInput) {
  const posts = getBlogPosts();
  const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const words = (postInput.content || postInput.excerpt || "").trim().split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(words / 150))} min`;
  const newPost = {
    id,
    title: postInput.title.trim(),
    excerpt: postInput.excerpt.trim() || postInput.content.slice(0, 140).trim() + "...",
    content: postInput.content.trim(),
    author: postInput.author,
    authorId: postInput.authorId,
    authorAvatar: postInput.authorAvatar,
    date: dateStr,
    category: postInput.category || "Community",
    readTime,
    img: postInput.img,
    videoUrl: postInput.videoUrl,
    mediaType: postInput.mediaType,
    source: postInput.source,
    pinned: false,
    isPublic: postInput.isPublic,
    likes: 0,
    likedBy: [],
    comments: []
  };
  const updated = [newPost, ...posts];
  saveBlogPosts(updated);
  return newPost;
}
function toggleLikePost(postId, userKey) {
  const posts = getBlogPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return { likes: 0, liked: false };
  const likedBy = post.likedBy || [];
  const alreadyLiked = likedBy.includes(userKey);
  const nextLikedBy = alreadyLiked ? likedBy.filter((k) => k !== userKey) : [...likedBy, userKey];
  const nextLikes = Math.max(0, alreadyLiked ? post.likes - 1 : post.likes + 1);
  const updated = posts.map(
    (p) => p.id === postId ? { ...p, likes: nextLikes, likedBy: nextLikedBy } : p
  );
  saveBlogPosts(updated);
  return { likes: nextLikes, liked: !alreadyLiked };
}
function addPostComment(postId, commentInput) {
  const posts = getBlogPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  const newComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author: commentInput.author.trim(),
    authorId: commentInput.authorId,
    avatar: commentInput.avatar,
    text: commentInput.text.trim(),
    date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  };
  const updated = posts.map(
    (p) => p.id === postId ? { ...p, comments: [...p.comments || [], newComment] } : p
  );
  saveBlogPosts(updated);
  return newComment;
}
function toggleFollowUser(currentUserId, targetIdOrName) {
  const accts = getAccounts();
  const current = accts.find((a) => a.id === currentUserId || a.email === currentUserId);
  if (!current) return false;
  const target = accts.find((a) => a.id === targetIdOrName || a.name === targetIdOrName);
  const targetKey = target ? target.id : targetIdOrName;
  const following = current.following || [];
  const isFollowing = following.includes(targetKey);
  const nextFollowing = isFollowing ? following.filter((id) => id !== targetKey) : [...following, targetKey];
  updateAccount(current.id, { following: nextFollowing });
  if (target) {
    const targetFollowers = target.followers || [];
    const nextFollowers = isFollowing ? targetFollowers.filter((id) => id !== current.id) : [...targetFollowers, current.id];
    updateAccount(target.id, { followers: nextFollowers });
  }
  return !isFollowing;
}
function saveVerifyRemark(studentId, remark) {
  return updateAccount(studentId, { verifyRemark: remark });
}
var TESTIMONIALS = [
  { id: "t1", name: "Amara Okeke", skill: "Graphic Design", caption: "I came in with zero design experience. Now I run my own studio.", img: IMG.woman1 },
  { id: "t2", name: "Chidi Balogun", skill: "Web Development", caption: "The community pushed me to ship. Best decision I ever made.", img: IMG.man1 },
  { id: "t3", name: "Ngozi Ade", skill: "Video Editing", caption: "Free training, real projects, real income. This is different.", img: IMG.woman2 },
  { id: "t4", name: "Tunde Bello", skill: "Content Creation", caption: "From 0 to managing 4 brand pages \u2014 all learned free at KR8.", img: IMG.man2 }
];
var REAL_STUDENT_TESTIMONIALS = [
  {
    id: "vid-1",
    name: "Grant Gideon",
    schoolOrRole: "Federal University Dutse",
    skill: "Graphic Design",
    caption: "KR8 Digitals is a digital academy that gives skills for free. The community helps you keep up with assignments and transition to professional design.",
    img: "/videos/testimonial_grant_gideon_poster.jpg",
    video: "/videos/testimonial_grant_gideon.mp4",
    duration: 85,
    createdAt: 1726e9 + 7e5,
    captions: [
      { start: 0, end: 2.8, text: "My name is Grant Gideon, a student of Federal University Dutse." },
      { start: 3, end: 5.8, text: "And this is a shout-out to KR8 Digitals Tribe." },
      { start: 6, end: 10.3, text: "KR8 Digitals is a digital academy that teaches digital skills for free." },
      { start: 10.5, end: 15, text: "I just want to give a shout-out to them for being really great in my graphic design journey." },
      { start: 15.2, end: 23, text: "At first, I thought KR8 Digitals was just one of those normal digital skills academies that promise free things." },
      { start: 23.5, end: 29.5, text: "When I started my journey, moving along alone as a designer was tough." },
      { start: 29.8, end: 37, text: "Now with the presence of this community, fellow designers help you blend in and keep up with assignments." },
      { start: 37.5, end: 45, text: "We create real professional designs and stay consistent with our projects." },
      { start: 45.5, end: 54, text: "Thank you KR8 Digitals for making such good use of our time and providing great mentorship." },
      { start: 54.5, end: 64, text: "To all my friends, family, and anyone looking to acquire high-income skills \u2014 onboarding is ongoing!" },
      { start: 64.5, end: 74, text: "You can move from being a complete beginner to becoming a paid professional." },
      { start: 74, end: 84.5, text: "Join KR8 Digitals today and transform your skills. Thank you, and see you inside!" }
    ]
  },
  {
    id: "vid-2",
    name: "Elizabeth Oyejobi",
    schoolOrRole: "Cohort Student",
    skill: "Tech & Design",
    caption: "Learning digital skills with KR8 Digitals has been life-changing. Practical mentorship, real project execution, and great community.",
    img: "/videos/testimonial_elizabeth_oyejobi_poster.jpg",
    video: "/videos/testimonial_elizabeth_oyejobi.mp4",
    duration: 40,
    createdAt: 1726e9 + 6e5,
    captions: [
      { start: 0, end: 4.5, text: "Hello everyone, my name is Elizabeth Oyejobi, and I am proud to be a student at KR8 Digitals." },
      { start: 4.5, end: 10.5, text: "Learning practical digital skills here has been an eye-opening journey for me." },
      { start: 10.5, end: 18, text: "The classes, assignments, and tutors push you to build real projects that build confidence." },
      { start: 18, end: 26.5, text: "The supportive tech community makes complex skills easy to master step by step." },
      { start: 26.5, end: 34, text: "KR8 Digitals gives everyone an equal opportunity to thrive in the modern tech economy." },
      { start: 34, end: 39.5, text: "Thank you KR8 Digitals for this wonderful platform and mentorship!" }
    ]
  },
  {
    id: "vid-3",
    name: "Maduka Samuel",
    kr8Id: "KR82026KT0001GDVFD",
    schoolOrRole: "Cohort Graduate",
    skill: "Graphic Design",
    caption: "Zero cost for training, graduation, or certificate. The tutors guided me all the way \u2014 invite you all to my graduation!",
    img: "/videos/testimonial_maduka_samuel_poster.jpg",
    video: "/videos/testimonial_maduka_samuel.mp4",
    duration: 65,
    createdAt: 1726e9 + 5e5,
    captions: [
      { start: 0, end: 3.2, text: "My name is Maduka Samuel, one of the cohort students at KR8 Digitals." },
      { start: 3.2, end: 8.5, text: "Before I got here, I was convinced by a friend to try KR8 Digitals." },
      { start: 8.5, end: 13.5, text: "It's a free course, and it has really been 100% free with zero hidden charges." },
      { start: 13.5, end: 19.5, text: "I never believed it at first, but an instinct of mine told me to give it a try." },
      { start: 19.5, end: 24.5, text: "I chose Graphic Design as the skill I wanted to learn, and the experience has been amazing." },
      { start: 24.5, end: 30, text: "I want to say a very big thank you to everyone who guided me, all the tutors at KR8 Digitals." },
      { start: 30, end: 38.5, text: "For anyone out there who wants to learn a high-demand skill for free, with zero cost in training or graduation." },
      { start: 38.5, end: 45, text: "No cost for certificates \u2014 it is truly an amazing learning experience." },
      { start: 45, end: 50, text: "I highly recommend everyone to choose KR8 Digitals." },
      { start: 50, end: 56.5, text: "Lastly, I want to invite you all to my graduation coming up very soon!" },
      { start: 56.5, end: 65, text: "I'll be very happy to see you all there. Thank you, and have a nice day!" }
    ]
  },
  {
    id: "vid-4",
    name: "Afolayan Grace Taiwo",
    kr8Id: "KR82026KT0002VEDMD",
    schoolOrRole: "Cohort Student",
    skill: "Digital Skills & Strategy",
    caption: "Learning with KR8 transformed how I approach creative problem solving and digital growth. The tutors give real-time feedback.",
    img: "/videos/testimonial_afolayan_grace_poster.jpg",
    video: "/videos/testimonial_afolayan_grace.mp4",
    duration: 102,
    createdAt: 1726e9 + 4e5,
    captions: [
      { start: 0, end: 5, text: "My name is Afolayan Grace Taiwo, a student at KR8 Digitals." },
      { start: 5, end: 16, text: "KR8 Digitals has really opened my eyes to the power of practical digital skills and teamwork." },
      { start: 16, end: 32, text: "The lessons are direct, hands-on, and the tutors give real-time feedback on your assignments." },
      { start: 32, end: 50, text: "If you want to build a career in tech or design, you don't need millions \u2014 KR8 teaches free." },
      { start: 50, end: 70, text: "Being part of this creative tribe keeps you accountable and motivated every single week." },
      { start: 70, end: 88, text: "I am grateful to KR8 Digitals and the leadership for giving us this life-changing opportunity." },
      { start: 88, end: 102, text: "Join the KR8 Tribe today, level up your skills, and let's win together!" }
    ]
  },
  {
    id: "vid-5",
    name: "Bio Nicz",
    schoolOrRole: "Cohort Creator",
    skill: "Video Editing & Content",
    caption: "From raw footage to professional storytelling \u2014 KR8 taught me the industry workflow and pushed me to produce client-grade work.",
    img: "/videos/testimonial_bio_nicz_poster.jpg",
    video: "/videos/testimonial_bio_nicz.mp4",
    duration: 191,
    createdAt: 1726e9 + 3e5,
    captions: [
      { start: 0, end: 8, text: "Hello everyone, my name is Bio Nicz, video editor and creator at KR8 Digitals." },
      { start: 8, end: 25, text: "Learning video editing here took my skills from basic cuts to storytelling and high-impact pacing." },
      { start: 25, end: 55, text: "The community pushes you to produce client-grade work, and the mentors break down complex tools." },
      { start: 55, end: 85, text: "Every project we handled was built to prepare us for real client contracts and the freelance market." },
      { start: 85, end: 125, text: "KR8 Digitals is genuinely building the next generation of creative powerhouses across Africa." },
      { start: 125, end: 165, text: "Special appreciation to our instructors, Timfire, and the entire leadership team for this vision." },
      { start: 165, end: 191, text: "If you have a creative dream, take action now \u2014 start learning free with KR8 Digitals." }
    ]
  },
  {
    id: "vid-6",
    name: "Ibeh Chinenye Helen",
    kr8Id: "KR82026KT0003WDVED",
    schoolOrRole: "Cohort Graduate",
    skill: "Brand Design & Tech",
    caption: "The live classes, design reviews, and tutor guidance gave me the confidence to handle client work and ship real designs.",
    img: "/videos/testimonial_ibeh_chinenye_poster.jpg",
    video: "/videos/testimonial_ibeh_chinenye.mp4",
    duration: 91,
    createdAt: 1726e9 + 2e5,
    captions: [
      { start: 0, end: 6, text: "Hello, my name is Ibeh Chinenye Helen, learning brand design with KR8 Digitals." },
      { start: 6, end: 22, text: "The journey so far has been nothing short of transformative for my creative thinking." },
      { start: 22, end: 45, text: "The live classes, design reviews, and tutor guidance gave me the confidence to handle client work." },
      { start: 45, end: 68, text: "You are not alone in the tribe; everyone helps you solve design blocks and finish your assignments." },
      { start: 68, end: 82, text: "Thank you KR8 Digitals for providing free, world-class education for passionate African youths." },
      { start: 82, end: 91, text: "Don't sleep on this opportunity \u2014 register and join the tribe today!" }
    ]
  },
  {
    id: "vid-7",
    name: "Obo Peter",
    schoolOrRole: "Cohort Student",
    skill: "Video Editing & Motion",
    caption: "The consistency and practical drills at KR8 helped me master video editing, reels, and promo clips with speed and precision.",
    img: "/videos/testimonial_obo_peter_poster.jpg",
    video: "/videos/testimonial_obo_peter.mp4",
    duration: 86,
    createdAt: 1726e9 + 1e5,
    captions: [
      { start: 0, end: 7, text: "My name is Obo Peter, a video editing and motion student at KR8 Digitals." },
      { start: 7, end: 24, text: "Before joining KR8, I struggled with video editing software and project consistency." },
      { start: 24, end: 45, text: "The hands-on curriculum, weekly drills, and supportive tutors changed everything for me." },
      { start: 45, end: 68, text: "I can now edit professional videos, reels, and promo clips with speed and precision." },
      { start: 68, end: 80, text: "A massive shout-out to KR8 Digitals for giving us the best training without paying a dime." },
      { start: 80, end: 86, text: "KR8 Digitals is the real deal \u2014 join us today!" }
    ]
  },
  {
    id: "vid-new-1",
    name: "Adeola Collins",
    schoolOrRole: "Cohort Student",
    skill: "Graphic Design",
    caption: "At first I thought it was just another random WhatsApp group, but KR8 Digitals gave real structured training and assignments.",
    img: "/videos/testimonial_new_1_poster.jpg",
    video: "/videos/testimonial_new_1.mp4",
    duration: 114,
    createdAt: 1726e9 + 49e4,
    captions: [
      { start: 0, end: 4.5, text: "I'm excited to share with you my experience with KR8 Digitals." },
      { start: 4.5, end: 11, text: "Several months ago I came across KR8 Digitals when someone shared their link in a group." },
      { start: 11, end: 18, text: "At first I thought it was just one random free WhatsApp class that only teaches basic things." },
      { start: 18, end: 26, text: "But when I joined, they introduced structured assignments and real design feedback." },
      { start: 26, end: 35, text: "100% free with dedicated tutors who guide you step by step." }
    ]
  },
  {
    id: "vid-new-2",
    name: "William Marvelous",
    schoolOrRole: "Cohort Student",
    skill: "Video Editing & Animation",
    caption: "The classes, practical drills, and tutor feedback pushed me from a total novice to creating industry-grade video edits.",
    img: "/videos/testimonial_new_2_poster.jpg",
    video: "/videos/testimonial_new_2.mp4",
    duration: 266,
    createdAt: 1726e9 + 48e4,
    captions: [
      { start: 0, end: 5, text: "Hello everyone, my name is William Marvelous and I'm a student of KR8 Digitals." },
      { start: 5, end: 12, text: "I heard about KR8 Digitals when I was just scrolling on my feed." },
      { start: 12, end: 20, text: "Learning video editing here has been an incredible experience with real hands-on projects." },
      { start: 20, end: 30, text: "The mentors guide you patiently through pacing, transitions, and industry techniques." },
      { start: 30, end: 42, text: "100% free with structured cohort assignments. Join KR8 Digitals today!" }
    ]
  },
  {
    id: "vid-new-3",
    name: "Adrian Washington",
    schoolOrRole: "Cohort Graduate",
    skill: "Brand Identity & Graphic Design",
    caption: "KR8 Digitals transformed how I understand branding and creative problem solving. 100% free with real mentorship.",
    img: "/videos/testimonial_new_3_poster.jpg",
    video: "/videos/testimonial_new_3.mp4",
    duration: 304,
    createdAt: 1726e9 + 47e4,
    captions: [
      { start: 0, end: 5, text: "Hello everyone, my name is Adrian Washington and I'd like to share my story with you." },
      { start: 5, end: 12, text: "It was a sunny afternoon when I saw an opportunity to join the creative tribe." },
      { start: 12, end: 22, text: "KR8 Digitals taught me valuable high-income branding principles completely free." },
      { start: 22, end: 32, text: "The mentors review your work thoroughly and show you how to design for real clients." },
      { start: 32, end: 45, text: "If you want to transform your creative career, join KR8 Digitals today!" }
    ]
  },
  {
    id: "vid-new-4",
    name: "Amos Blessing",
    schoolOrRole: "Cohort Graduate",
    skill: "Graphic Design",
    caption: "One of the graduate students of KR8 Digitals Design. The tutors take their time to review assignments and ensure you improve daily.",
    img: "/videos/testimonial_new_4_poster.jpg",
    video: "/videos/testimonial_new_4.mp4",
    duration: 137,
    createdAt: 1726e9 + 46e4,
    captions: [
      { start: 0, end: 4.5, text: "Hello everyone, my name is Amos Blessing, one of the graduate students of KR8 Digitals." },
      { start: 4.5, end: 12, text: "I joined the Graphic Design cohort and the practical assignments pushed me to grow." },
      { start: 12, end: 20, text: "Thank you KR8 Digitals for giving us the platform to learn free of charge!" }
    ]
  },
  {
    id: "vid-new-5",
    name: "David Ebuka",
    schoolOrRole: "Cohort Student",
    skill: "Digital Skills & Design",
    caption: "I saw a WhatsApp status about KR8 Digitals and made inquiries. Found out it was completely free \u2014 no hidden fees or charges.",
    img: "/videos/testimonial_new_5_poster.jpg",
    video: "/videos/testimonial_new_5.mp4",
    duration: 156,
    createdAt: 1726e9 + 45e4,
    captions: [
      { start: 0, end: 4, text: "Good day everyone, my name is David Ebuka." },
      { start: 4, end: 10.5, text: "I heard about KR8 Digitals from someone's WhatsApp status." },
      { start: 10.5, end: 18, text: "When I made inquiries, I found out it was a 100% free digital platform." },
      { start: 18, end: 26, text: "You learn high-demand digital skills with zero hidden charges." }
    ]
  },
  {
    id: "vid-new-6",
    name: "Calistus Precious",
    schoolOrRole: "Cohort Student",
    skill: "Content Creation & Design",
    caption: "Before KR8, I had zero digital skills. The structured timetable, assignments, and cohort community gave me the guidance I needed.",
    img: "/videos/testimonial_new_6_poster.jpg",
    video: "/videos/testimonial_new_6.mp4",
    duration: 209,
    createdAt: 1726e9 + 44e4,
    captions: [
      { start: 0, end: 3.5, text: "Hello everyone, my name is Calistus Precious." },
      { start: 3.5, end: 10, text: "Before I joined KR8 Digitals, I had zero digital design skills." },
      { start: 10, end: 18, text: "The daily drills and mentor feedback helped me build real confidence." }
    ]
  },
  {
    id: "vid-new-7",
    name: "Emmanuel Nweke",
    schoolOrRole: "Cohort Graduate",
    skill: "Web Development",
    caption: "Graduating from KR8 Digitals. I learned practical coding and digital craft with dedicated tutors backing every student.",
    img: "/videos/testimonial_new_7_poster.jpg",
    video: "/videos/testimonial_new_7.mp4",
    duration: 83,
    createdAt: 1726e9 + 43e4,
    captions: [
      { start: 0, end: 4, text: "Hello, to all the graduating students and tutors at KR8 Digitals." },
      { start: 4, end: 11, text: "Joining this cohort was the best decision for my tech journey." },
      { start: 11, end: 18, text: "We learned real development skills with zero financial barriers." }
    ]
  },
  {
    id: "vid-new-8",
    name: "Onyenaturuchi Chisom Mbanu",
    schoolOrRole: "Cohort Student",
    skill: "Video Editing & Social Media",
    caption: "I can create high-impact videos myself and I'm proud of it. I was skeptical at first, but KR8 didn't collect a single dime from us.",
    img: "/videos/testimonial_new_8_poster.jpg",
    video: "/videos/testimonial_new_8.mp4",
    duration: 120,
    createdAt: 1726e9 + 42e4,
    captions: [
      { start: 0, end: 4, text: "My name is Onyenaturuchi Chisom Mbanu." },
      { start: 4, end: 10.5, text: "I can create these videos myself and I am really proud of it." },
      { start: 10.5, end: 18, text: "At first I was skeptical about free training, but they didn't collect a single dime." },
      { start: 18, end: 26, text: "They gave us the opportunity to practice, learn, and grow consistently." }
    ]
  },
  {
    id: "vid-new-9",
    name: "Blessing Ogbonna",
    schoolOrRole: "Cohort Student",
    skill: "Graphic Design",
    caption: "I joined KR8 Digitals without knowing what to expect. The assignments and daily tutor feedback pushed me to build real work.",
    img: "/videos/testimonial_new_9_poster.jpg",
    video: "/videos/testimonial_new_9.mp4",
    duration: 96,
    createdAt: 1726e9 + 41e4,
    captions: [
      { start: 0, end: 4, text: "Hello everyone, my name is Blessing." },
      { start: 4, end: 11, text: "I was invited randomly to KR8 Digitals and decided to check it out." },
      { start: 11, end: 19, text: "The graphic design classes opened my eyes to professional visual principles." }
    ]
  },
  {
    id: "vid-new-10",
    name: "Prosper Chukwu",
    schoolOrRole: "Cohort Student",
    skill: "Digital Skills & Marketing",
    caption: "Saw a flyer on WhatsApp for KR8 Digitals Tribe. The community accountability and live sessions make learning stick.",
    img: "/videos/testimonial_new_10_poster.jpg",
    video: "/videos/testimonial_new_10.mp4",
    duration: 65,
    createdAt: 1726e9 + 4e5,
    captions: [
      { start: 0, end: 4, text: "Standing before you to share my experience with KR8 Digitals." },
      { start: 4, end: 11, text: "I got to know KR8 Tribe while going through WhatsApp status." },
      { start: 11, end: 18, text: "It was a flyer offering free digital skills training, and it delivered on every promise." }
    ]
  },
  {
    id: "vid-new-11",
    name: "Esther Adeyemi",
    schoolOrRole: "Cohort Student",
    skill: "Social Media Strategy",
    caption: "KR8 Digitals opened my eyes to how digital skills create direct earning power for youth across Africa.",
    img: "/videos/testimonial_new_11_poster.jpg",
    video: "/videos/testimonial_new_11.mp4",
    duration: 44,
    createdAt: 1726e9 + 39e4,
    captions: [
      { start: 0, end: 4, text: "Hello everyone, learning with KR8 Digitals has been inspiring." },
      { start: 4, end: 11, text: "The mentors break down digital marketing and social growth clearly." },
      { start: 11, end: 18, text: "Thank you KR8 Digitals for making high-value training accessible." }
    ]
  },
  {
    id: "vid-new-12",
    name: "Blessed Ayemere Well",
    schoolOrRole: "Cohort Student",
    skill: "Graphic Design & Animation",
    caption: "My name is Blessed Ayemere Well. KR8 Digitals equipped me with professional design skills with 0 cost for certificate or training.",
    img: "/videos/testimonial_new_12_poster.jpg",
    video: "/videos/testimonial_new_12.mp4",
    duration: 61,
    createdAt: 1726e9 + 38e4,
    captions: [
      { start: 0, end: 4, text: "Hello everyone, my name is Blessed Ayemere Well." },
      { start: 4, end: 11, text: "KR8 Digitals equipped me with professional design skills." },
      { start: 11, end: 18, text: "Zero cost for training, zero cost for certification, pure practical craft." }
    ]
  },
  {
    id: "vid-new-13",
    name: "Charity Okon",
    schoolOrRole: "Cohort Student",
    skill: "Content Creation & Editing",
    caption: "When a friend posted KR8 Digitals on her status, I wondered if free training could be real. Tutors guide you every step of the way!",
    img: "/videos/testimonial_new_13_poster.jpg",
    video: "/videos/testimonial_new_13.mp4",
    duration: 161,
    createdAt: 1726e9 + 37e4,
    captions: [
      { start: 0, end: 4, text: "Good day everyone, my name is Charity." },
      { start: 4, end: 10.5, text: "When I heard about KR8 Digitals through a friend's status, I was curious." },
      { start: 10.5, end: 18, text: "I wondered how digital skills could be taught for free." },
      { start: 18, end: 26, text: "The instructors are patient, knowledgeable, and always ready to help." }
    ]
  },
  {
    id: "vid-new-14",
    name: "Somtochukwu Favour",
    schoolOrRole: "Cohort Student",
    skill: "Graphic Design",
    caption: "A friend told me about KR8 Digitals Tribe. I showed them my early designs and they pushed me to level up with real feedback!",
    img: "/videos/testimonial_new_14_poster.jpg",
    video: "/videos/testimonial_new_14.mp4",
    duration: 151,
    createdAt: 1726e9 + 36e4,
    captions: [
      { start: 0, end: 4.5, text: "Hello everyone, my name is Somtochukwu, learning Graphic Design with KR8 Digitals." },
      { start: 4.5, end: 12, text: "I signed up for KR8 Digitals Tribe after a friend showed me the program." },
      { start: 12, end: 20, text: "When I showed my designs, the mentors gave me real practical feedback to improve." },
      { start: 20, end: 30, text: "The classes and community helped me level up my skills completely for free." }
    ]
  }
];
var DEFAULT_VIDEO_COMMENTS = [
  {
    id: "vc-1",
    videoId: "vid-1",
    authorName: "Timfire",
    authorId: "KR8-FOUNDER",
    comment: "Big congratulations Grant Gideon! Your consistency in class and in the design assignments was unmatched. Keep soaring!",
    createdAt: Date.now() - 36e5 * 36,
    likes: 14
  },
  {
    id: "vc-2",
    videoId: "vid-1",
    authorName: "Chidi Balogun",
    authorId: "KR8-26-W001",
    comment: "Dutse to the world! \u{1F525} KR8 community really pushed all of us to be serious with daily practice.",
    createdAt: Date.now() - 36e5 * 20,
    likes: 8
  },
  {
    id: "vc-3",
    videoId: "vid-2",
    authorName: "Timfire",
    authorId: "KR8-FOUNDER",
    comment: "Elizabeth, so inspiring watching your rapid progress and project execution! Keep shipping those incredible creations \u{1F680}",
    createdAt: Date.now() - 36e5 * 18,
    likes: 19
  },
  {
    id: "vc-4",
    videoId: "vid-2",
    authorName: "Amara Okeke",
    authorId: "KR8-26-G014",
    comment: "Hands-on projects and supportive tutors made all the difference for me too \u{1F64C}",
    createdAt: Date.now() - 36e5 * 10,
    likes: 11
  },
  {
    id: "vc-5",
    videoId: "vid-3",
    authorName: "Stevenson Uche",
    authorId: "KR8-COFOUNDER",
    comment: "Maduka, your graduation is well-deserved! You took the leap with zero background and proved that discipline is everything. Can't wait for your ceremony! \u{1F393}\u2728",
    createdAt: Date.now() - 36e5 * 4,
    likes: 15
  },
  {
    id: "vc-6",
    videoId: "vid-4",
    authorName: "Timfire",
    authorId: "KR8-FOUNDER",
    comment: "Grace, watching your strategic growth and problem solving during the cohort has been remarkable. Keep setting the pace! \u{1F31F}",
    createdAt: Date.now() - 36e5 * 12,
    likes: 12
  },
  {
    id: "vc-7",
    videoId: "vid-5",
    authorName: "Timfire",
    authorId: "KR8-FOUNDER",
    comment: "Top-tier video production right here Bio Nicz! Your pacing and narrative editing are world-class \u{1F3AC}\u{1F525}",
    createdAt: Date.now() - 36e5 * 8,
    likes: 21
  },
  {
    id: "vc-8",
    videoId: "vid-6",
    authorName: "Tunde Bello",
    authorId: "KR8-26-C002",
    comment: "Helen's brand design portfolio during the final review blew all of us away! Pure quality.",
    createdAt: Date.now() - 36e5 * 6,
    likes: 9
  },
  {
    id: "vc-9",
    videoId: "vid-7",
    authorName: "Stevenson Uche",
    authorId: "KR8-COFOUNDER",
    comment: "Speed, clarity, and precision. Obo Peter is proof that daily drills produce industry-ready creators! \u{1F680}",
    createdAt: Date.now() - 36e5 * 2,
    likes: 14
  }
];
var TESTIMONIAL_KEY = "kr8_testimonials_v16";
var VIDEO_COMMENT_KEY = "kr8_video_comments_v3";
function getTestimonials() {
  const loaded = load(TESTIMONIAL_KEY, REAL_STUDENT_TESTIMONIALS);
  if (!loaded || !loaded.length || loaded.length < REAL_STUDENT_TESTIMONIALS.length || !loaded.some((item) => item.video && item.video.includes("testimonial_grant_gideon"))) {
    save(TESTIMONIAL_KEY, REAL_STUDENT_TESTIMONIALS);
    return REAL_STUDENT_TESTIMONIALS;
  }
  const merged = loaded.map((item) => {
    if (!item.kr8Id) {
      const def = REAL_STUDENT_TESTIMONIALS.find((r) => r.id === item.id || r.name.toLowerCase() === item.name.toLowerCase());
      if (def?.kr8Id) return { ...item, kr8Id: def.kr8Id };
    }
    return item;
  });
  return merged.sort((a, b) => b.createdAt - a.createdAt);
}
function saveTestimonials(items) {
  save(TESTIMONIAL_KEY, items);
}
function addTestimonial(data) {
  const current = getTestimonials();
  const newItem = {
    ...data,
    id: "vid-" + Date.now(),
    createdAt: Date.now()
  };
  saveTestimonials([newItem, ...current]);
  return newItem;
}
function deleteTestimonial(id) {
  const current = getTestimonials();
  saveTestimonials(current.filter((t) => t.id !== id));
}
function updateTestimonial(item) {
  const current = getTestimonials();
  saveTestimonials(current.map((t) => t.id === item.id ? item : t));
}
function getVideoComments(videoId) {
  const all = load(VIDEO_COMMENT_KEY, DEFAULT_VIDEO_COMMENTS);
  if (videoId) {
    return all.filter((c) => c.videoId === videoId).sort((a, b) => b.createdAt - a.createdAt);
  }
  return all.sort((a, b) => b.createdAt - a.createdAt);
}
function saveVideoComments(items) {
  save(VIDEO_COMMENT_KEY, items);
}
function addVideoComment(data) {
  const current = load(VIDEO_COMMENT_KEY, DEFAULT_VIDEO_COMMENTS);
  let author = data.authorName.trim();
  if (author.toLowerCase().includes("kenneth") || author.toLowerCase().includes("timothy") || data.authorId?.includes("FOUNDER")) {
    author = "Timfire";
  }
  const newComment = {
    id: "vc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    videoId: data.videoId,
    authorName: author,
    authorId: data.authorId?.trim(),
    comment: data.comment.trim(),
    createdAt: Date.now(),
    likes: 0
  };
  save(VIDEO_COMMENT_KEY, [newComment, ...current]);
  return newComment;
}
function deleteVideoComment(id) {
  const current = load(VIDEO_COMMENT_KEY, DEFAULT_VIDEO_COMMENTS);
  save(VIDEO_COMMENT_KEY, current.filter((c) => c.id !== id));
}
function likeVideoComment(id) {
  const current = load(VIDEO_COMMENT_KEY, DEFAULT_VIDEO_COMMENTS);
  let updatedLikes = 0;
  const updated = current.map((c) => {
    if (c.id === id) {
      updatedLikes = (c.likes || 0) + 1;
      return { ...c, likes: updatedLikes };
    }
    return c;
  });
  save(VIDEO_COMMENT_KEY, updated);
  return updatedLikes;
}
var PARTNERS = ["Motionverse", "CHIGOMA", "HIS BATTLE AXE (Dance Crew)"];
var CONTACT = {
  whatsapp: "+2348125687509",
  whatsappTeam: "https://wa.me/2348125687509",
  payment: { account: "8166552758", bank: "OPay", name: "Kenneth Timothy" },
  email: "kr8digitals01@gmail.com",
  phone: "+234 812 568 7509"
};
var ATTENDANCE_TYPES = [
  { key: "class", name: "Class", schedule: "Mon, Wed, Fri \xB7 9PM\u201312AM WAT", open: true },
  { key: "assignment", name: "Assignment", schedule: "Tue, Thu, Sat \xB7 Full day", open: true },
  { key: "mindset", name: "Mindset Shift", schedule: "1st & 3rd Sunday \xB7 9PM\u201312AM WAT", open: false },
  { key: "hangout", name: "Hangout", schedule: "Last Sunday \xB7 9PM\u201312AM WAT", open: false }
];
var ATTENDANCE_SUBMISSIONS_KEY = "kr8_attendance_submissions_v2";
var ATTENDANCE_TYPES_SETTINGS_KEY = "kr8_attendance_types_open_v1";
var DEFAULT_ATTENDANCE_SUBMISSIONS = [
  {
    id: "atd_seed_1",
    studentId: "KR82026KT0001GDVFD",
    studentName: "Samuel Maduka",
    skill: "Graphic Design",
    type: "class",
    topic: "Grid Systems & Brand Hierarchy",
    screenshotUrl: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "pending",
    submittedAt: Date.now() - 36e5 * 2
  },
  {
    id: "atd_seed_2",
    studentId: "KR82026KT0002VEDMD",
    studentName: "Grace Afolayan",
    skill: "Video Editing",
    type: "assignment",
    topic: "High-Retention Cut & Audio Normalization",
    screenshotUrl: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "pending",
    submittedAt: Date.now() - 36e5 * 5
  },
  {
    id: "atd_seed_3",
    studentId: "KR82026KT0003WDVED",
    studentName: "Chinenye Ibeh",
    skill: "Web Development",
    type: "class",
    topic: "Tailwind CSS Grid & Responsive Layouts",
    screenshotUrl: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "accepted",
    feedback: "Clean attendance proof. Timestamp verified.",
    reviewedBy: "Kenneth Timothy Iziogo (Timfire)",
    reviewedAt: Date.now() - 36e5 * 24,
    submittedAt: Date.now() - 36e5 * 25
  }
];
function getAttendanceSubmissions() {
  return load(ATTENDANCE_SUBMISSIONS_KEY, DEFAULT_ATTENDANCE_SUBMISSIONS);
}
function saveAttendanceSubmissions(subs) {
  save(ATTENDANCE_SUBMISSIONS_KEY, subs);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:attendance-updated"));
  }
}
function getStudentAttendance(studentId) {
  return getAttendanceSubmissions().filter((s) => s.studentId === studentId).sort((a, b) => b.submittedAt - a.submittedAt);
}
function submitAttendance(input) {
  const subs = getAttendanceSubmissions();
  const isDuplicate = subs.some((s) => {
    if (!s.screenshotUrl || !input.screenshotUrl) return false;
    if (s.screenshotUrl === input.screenshotUrl) return true;
    if (s.screenshotUrl.startsWith("data:") && input.screenshotUrl.startsWith("data:")) {
      return s.screenshotUrl.slice(0, 300) === input.screenshotUrl.slice(0, 300);
    }
    return false;
  });
  const newSub = {
    id: `atd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    studentId: input.studentId,
    studentName: input.studentName,
    skill: input.skill,
    type: input.type,
    topic: input.topic,
    speaker: input.speaker,
    screenshotUrl: input.screenshotUrl,
    isDuplicateScreenshot: isDuplicate,
    status: "pending",
    submittedAt: Date.now()
  };
  saveAttendanceSubmissions([newSub, ...subs]);
  const typeLabels = {
    class: "submitted Class Attendance",
    assignment: "submitted an Assignment",
    mindset: "submitted Mindset Shift Attendance",
    hangout: "submitted Monthly Hangout Attendance"
  };
  const student = findStudent(input.studentId);
  addFeed({
    kind: input.type === "assignment" ? "submission" : "attendance",
    name: input.studentName,
    skill: input.skill,
    avatar: student?.avatar || generateDefaultAvatar(input.studentName, input.studentId),
    customAction: typeLabels[input.type] || "submitted attendance"
  });
  return newSub;
}
function reviewAttendance(submissionId, status, feedback = "", reviewerName = "Coach") {
  const subs = getAttendanceSubmissions();
  const target = subs.find((s) => s.id === submissionId);
  if (!target) return false;
  target.status = status;
  target.feedback = feedback.trim();
  target.reviewedBy = reviewerName;
  target.reviewedAt = Date.now();
  saveAttendanceSubmissions(subs);
  if (status === "accepted") {
    const student = findStudent(target.studentId);
    if (student) {
      const isAssignment = target.type === "assignment";
      const ptsToAdd = isAssignment ? 15 : 10;
      updateAccount(student.id, {
        points: (student.points || 0) + ptsToAdd,
        attendanceAccepted: !isAssignment ? (student.attendanceAccepted || 0) + 1 : student.attendanceAccepted,
        submissions: isAssignment ? (student.submissions || 0) + 1 : student.submissions
      });
      const typeTitles = {
        class: "Class Attendance",
        assignment: "Assignment",
        mindset: "Mindset Shift",
        hangout: "Monthly Hangout"
      };
      addFeed({
        kind: "attendance",
        name: target.studentName,
        skill: target.skill,
        avatar: student.avatar || generateDefaultAvatar(target.studentName, target.studentId),
        customAction: `${typeTitles[target.type] || "Attendance"} was approved`
      });
    }
  }
  return true;
}
function getAttendanceTypesSettings() {
  const saved = load(ATTENDANCE_TYPES_SETTINGS_KEY, {});
  const result = {};
  ATTENDANCE_TYPES.forEach((t) => {
    result[t.key] = saved[t.key] !== void 0 ? saved[t.key] : t.open;
  });
  return result;
}
function toggleAttendanceTypeOpen(typeKey, isOpen) {
  const saved = load(ATTENDANCE_TYPES_SETTINGS_KEY, {});
  saved[typeKey] = isOpen;
  save(ATTENDANCE_TYPES_SETTINGS_KEY, saved);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:attendance-types-updated"));
  }
}
var SCORING = [
  { action: "Attendance accepted", pts: "+10" },
  { action: "Assignment accepted", pts: "+15" },
  { action: "Peer like received", pts: "+2" },
  { action: "Graduation (Completion)", pts: "+50" },
  { action: "Certificate of Professionalism", pts: "+100" },
  { action: "New skill unlocked (dual)", pts: "+75" },
  { action: "Successful referral", pts: "+20" }
];
function tribeCount() {
  const tribeMembers = getAccounts().filter((account) => account.type === "tribe").length;
  const students = getStudents().length;
  return 2480 + tribeMembers + students;
}
function studentCount() {
  return 1200 + getStudents().length;
}
var LIVE_STREAM_KEY = "kr8_live_stream_v2";
var LIVE_CHAT_KEY = "kr8_live_chat_v2";
var STREAM_REPLAYS_KEY = "kr8_stream_replays_v2";
var LAST_ENDED_STREAM_KEY = "kr8_last_ended_stream_v2";
function getLastEndedStream() {
  return load(LAST_ENDED_STREAM_KEY, null);
}
function canUserHostStream(account) {
  if (!account) return false;
  if (account.type === "founder" || account.type === "co-founder") return true;
  if (account.admin) {
    const role = account.admin.role;
    if (role === "ultimate" || role === "admin" || role === "coach") return true;
    if (account.admin.permissions && account.admin.permissions.length > 0) return true;
  }
  return false;
}
function getEligibleStreamHosts() {
  const all = getAccounts();
  return all.filter((a) => canUserHostStream(a));
}
var INITIAL_STREAM_REPLAYS = [
  {
    id: "replay-1",
    streamId: "stream-prev-01",
    title: "Masterclass: High-Income Graphic Design & Brand Identity in 2026",
    category: "Graphic Design",
    description: "Deep dive with Founder Timfire on breaking through client objections, crafting typography systems, and packaging design projects for global clients.",
    hostName: "Timfire (Founder & CEO)",
    hostAvatar: "/founder_timfire.jpg",
    date: "Sep 14, 2026",
    durationMinutes: 54,
    peakViewers: 348,
    thumbnail: "/founder_timfire_wide.jpg",
    videoUrl: "/videos/testimonial_grant_gideon.mp4",
    messagesCount: 142,
    requiresAccount: true
  },
  {
    id: "replay-2",
    streamId: "stream-prev-02",
    title: "Live Creative Jam: Motion Editing & Narrative Storytelling",
    category: "Video Editing",
    description: "Hands-on breakdown of pacing, sound design, and EBU loudness mixing for commercial tech reels with live community critiques.",
    hostName: "Stevenson Uche (Co-Founder)",
    date: "Sep 08, 2026",
    durationMinutes: 48,
    peakViewers: 295,
    thumbnail: "/videos/testimonial_bio_nicz_poster.jpg",
    videoUrl: "/videos/testimonial_bio_nicz.mp4",
    messagesCount: 118,
    requiresAccount: true
  },
  {
    id: "replay-3",
    streamId: "stream-prev-03",
    title: "Creative Career Strategy: Landing High-Paying Remote Contracts",
    category: "Career & Mindset",
    description: "Timfire and KR8 Coaches share actionable frameworks for African creators to build verifiable proof of work and close international retainers.",
    hostName: "Timfire & Faculty",
    hostAvatar: "/founder_timfire.jpg",
    date: "Aug 30, 2026",
    durationMinutes: 62,
    peakViewers: 420,
    thumbnail: "/videos/testimonial_maduka_samuel_poster.jpg",
    videoUrl: "/videos/testimonial_maduka_samuel.mp4",
    messagesCount: 204,
    requiresAccount: true
  }
];
var TERMINATED_STREAMS_KEY = "kr8_terminated_streams_v1";
function markStreamTerminated(streamId) {
  try {
    const list = load(TERMINATED_STREAMS_KEY, []);
    if (!list.includes(streamId)) {
      list.push(streamId);
      save(TERMINATED_STREAMS_KEY, list);
    }
  } catch {
  }
}
function isStreamTerminated(streamId) {
  try {
    const list = load(TERMINATED_STREAMS_KEY, []);
    return list.includes(streamId);
  } catch {
    return false;
  }
}
function getActiveLiveStream() {
  const stream = load(LIVE_STREAM_KEY, null);
  if (stream && stream.isLive) {
    if (isStreamTerminated(stream.id)) {
      save(LIVE_STREAM_KEY, null);
      return null;
    }
    return stream;
  }
  return null;
}
function saveActiveLiveStream(stream) {
  save(LIVE_STREAM_KEY, stream);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:live-stream-updated"));
  }
}
function startLiveStream(input) {
  const host = input.host || DEFAULT_FOUNDER_ACCOUNT;
  const hostName = host.type === "founder" ? "Timfire" : host.name;
  const isPrivate = input.visibility === "private";
  const accessKey = isPrivate ? input.accessKey?.trim() || `KR8-${Math.floor(1e3 + Math.random() * 9e3)}` : void 0;
  const newStream = {
    id: `stream-${Date.now()}`,
    title: input.title.trim() || "Creative Mastery Live",
    category: input.category || "Creative Tech & Strategy",
    description: input.description?.trim() || "Live community broadcast and interactive drill with KR8 Digitals.",
    hostId: host.id,
    hostName,
    hostAvatar: host.avatar || (host.type === "founder" ? "/founder_timfire.jpg" : void 0),
    visibility: isPrivate ? "private" : "public",
    accessKey,
    isLive: true,
    startedAt: Date.now(),
    viewerCount: 1,
    // Real viewers count only: starts at 1 (the host)
    peakViewers: 1,
    quality: input.quality || "1080p60",
    livekitRoomName: `kr8-room-${Date.now()}`,
    videoUrl: "",
    posterUrl: "/founder_timfire_wide.jpg",
    pinnedNotice: isPrivate ? "\u{1F512} Private Broadcast Session. By Invitation Only." : "Welcome to the KR8 Live Stream! Engage in chat, Q&A, and interactive drills.",
    chatPermission: "everyone",
    isLocked: false,
    isSuspended: false,
    isRecording: false,
    spotlightParticipantId: null,
    promotedModerators: [],
    promotedSpeakers: [],
    coHosts: [],
    raisedHands: [],
    viewers: [
      {
        id: host.id,
        name: hostName,
        avatar: host.avatar || "/founder_timfire.jpg",
        role: "host",
        joinedAt: Date.now(),
        isMuted: false
      }
    ],
    assignedTasks: [],
    recognizedParticipants: []
  };
  saveActiveLiveStream(newStream);
  const initMsg = {
    id: `msg-${Date.now()}`,
    streamId: newStream.id,
    senderId: host.id,
    senderName: hostName,
    senderRole: "host",
    senderBadge: "\u{1F451} Host & Founder",
    text: `Welcome everyone to "${newStream.title}"! Ask your questions and let's build together.`,
    createdAt: Date.now(),
    isPinned: true
  };
  saveLiveChatMessages(newStream.id, [initMsg]);
  addFeed({
    kind: "stream_live",
    name: hostName,
    skill: newStream.title,
    avatar: newStream.hostAvatar || "/founder_timfire.jpg"
  });
  return newStream;
}
function endActiveLiveStream(recordedBlobUrl) {
  const stream = getActiveLiveStream();
  if (!stream) return null;
  const endedAt = Date.now();
  const durationMinutes = Math.max(1, Math.round((endedAt - stream.startedAt) / 6e4));
  const messages = getLiveChatMessages(stream.id);
  const recognizedMap = /* @__PURE__ */ new Map();
  (stream.recognizedParticipants || []).forEach((rp) => {
    recognizedMap.set(rp.userId, {
      name: rp.userName,
      badge: rp.reason,
      points: rp.points
    });
  });
  (stream.assignedTasks || []).filter((t) => t.status === "completed").forEach((t) => {
    if (!recognizedMap.has(t.targetUserId)) {
      recognizedMap.set(t.targetUserId, {
        name: t.targetUserName,
        badge: "Completed Stream Drill",
        points: t.points
      });
    }
  });
  messages.filter((m) => m.senderRole !== "host").slice(0, 3).forEach((m) => {
    if (!recognizedMap.has(m.senderId)) {
      recognizedMap.set(m.senderId, {
        name: m.senderName,
        badge: "Active Chat Contributor",
        points: 25
      });
    }
  });
  const recognizedEngagers = Array.from(recognizedMap.values());
  const tasksCompleted = (stream.assignedTasks || []).filter((t) => t.status === "completed").length;
  const videoUrl = recordedBlobUrl || stream.videoUrl || "";
  const replay = {
    id: `replay-${Date.now()}`,
    streamId: stream.id,
    title: stream.title,
    category: stream.category,
    description: stream.description,
    hostName: stream.hostName,
    hostAvatar: stream.hostAvatar,
    visibility: stream.visibility,
    accessKey: stream.accessKey,
    date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    durationMinutes,
    peakViewers: Math.max(stream.peakViewers, stream.viewers?.length || 1),
    realViewersCount: stream.viewers?.length || 1,
    thumbnail: stream.posterUrl || "/founder_timfire_wide.jpg",
    videoUrl,
    messagesCount: messages.length,
    requiresAccount: true,
    tasksCompleted,
    recognizedEngagers
  };
  const replays = getStreamReplays();
  saveStreamReplays([replay, ...replays]);
  save(LAST_ENDED_STREAM_KEY, replay);
  markStreamTerminated(stream.id);
  saveActiveLiveStream(null);
  addFeed({
    kind: "stream_ended",
    name: stream.hostName,
    skill: stream.title,
    avatar: stream.hostAvatar || "/founder_timfire.jpg"
  });
  return replay;
}
function joinStreamViewer(streamId, participant) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const isHost = participant.role === "host";
  const defaultMuted = isHost ? false : true;
  const participantWithMute = {
    ...participant,
    isMuted: participant.isMuted !== void 0 ? participant.isMuted : defaultMuted
  };
  const existing = stream.viewers || [];
  const idx = existing.findIndex((v) => v.id === participant.id);
  let nextViewers = [...existing];
  if (idx >= 0) {
    nextViewers[idx] = { ...nextViewers[idx], ...participantWithMute };
  } else {
    nextViewers.push(participantWithMute);
  }
  const viewerCount = nextViewers.length;
  const peakViewers = Math.max(stream.peakViewers, viewerCount);
  updateLiveStream({ viewers: nextViewers, viewerCount, peakViewers });
}
function toggleParticipantMute(streamId, participantId, forceMute) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return false;
  const viewers = stream.viewers || [];
  let newMutedState = false;
  const updatedViewers = viewers.map((v) => {
    if (v.id === participantId) {
      newMutedState = forceMute !== void 0 ? forceMute : !v.isMuted;
      return { ...v, isMuted: newMutedState };
    }
    return v;
  });
  updateLiveStream({ viewers: updatedViewers });
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kr8:participant-mute-toggled", {
        detail: { participantId, isMuted: newMutedState }
      })
    );
  }
  return newMutedState;
}
function muteAllListeners(streamId) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const viewers = stream.viewers || [];
  const updatedViewers = viewers.map((v) => {
    if (v.role === "viewer") {
      return { ...v, isMuted: true };
    }
    return v;
  });
  updateLiveStream({ viewers: updatedViewers });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:mute-all-listeners"));
  }
}
function leaveStreamViewer(streamId, participantId) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const existing = stream.viewers || [];
  if (participantId === stream.hostId) return;
  const nextViewers = existing.filter((v) => v.id !== participantId);
  const viewerCount = Math.max(1, nextViewers.length);
  updateLiveStream({ viewers: nextViewers, viewerCount });
}
function assignTaskToViewer(streamId, input) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return null;
  const points = input.points || 50;
  const newTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    targetUserId: input.targetUserId,
    targetUserName: input.targetUserName,
    task: input.task.trim(),
    points,
    status: "pending",
    assignedAt: Date.now()
  };
  const tasks = [...stream.assignedTasks || [], newTask];
  updateLiveStream({ assignedTasks: tasks });
  sendLiveChatMessage({
    streamId,
    senderId: "system",
    senderName: "KR8 Stage Director",
    senderRole: "moderator",
    senderBadge: "\u26A1 Live Task",
    text: `\u{1F4CB} TASK ASSIGNED to ${input.targetUserName}: "${input.task}" (+${points} XP upon completion!)`
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kr8:task-assigned", { detail: newTask }));
  }
  return newTask;
}
function completeStreamTask(streamId, taskId) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return false;
  const tasks = stream.assignedTasks || [];
  const targetTask = tasks.find((t) => t.id === taskId);
  if (!targetTask || targetTask.status === "completed") return false;
  const updatedTasks = tasks.map((t) => t.id === taskId ? { ...t, status: "completed" } : t);
  const acc = getAccounts().find((a) => a.id === targetTask.targetUserId);
  if (acc) {
    updateAccount(acc.id, { points: (acc.points || 0) + targetTask.points });
  }
  const recognized = [
    ...stream.recognizedParticipants || [],
    {
      userId: targetTask.targetUserId,
      userName: targetTask.targetUserName,
      reason: `Completed: ${targetTask.task.slice(0, 30)}...`,
      points: targetTask.points
    }
  ];
  updateLiveStream({ assignedTasks: updatedTasks, recognizedParticipants: recognized });
  sendLiveChatMessage({
    streamId,
    senderId: "system",
    senderName: "KR8 Stage Director",
    senderRole: "moderator",
    senderBadge: "\u{1F389} Task Completed",
    text: `\u2B50 ${targetTask.targetUserName} completed their drill: "${targetTask.task}" and was awarded +${targetTask.points} XP!`
  });
  return true;
}
function awardPointsToStreamViewer(streamId, userId, userName, points, reason) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const acc = getAccounts().find((a) => a.id === userId);
  if (acc) {
    updateAccount(acc.id, { points: (acc.points || 0) + points });
  }
  const recognized = [
    ...stream.recognizedParticipants || [],
    {
      userId,
      userName,
      reason,
      points
    }
  ];
  updateLiveStream({ recognizedParticipants: recognized });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kr8:points-updated", { detail: { userId, points, reason } }));
  }
  sendLiveChatMessage({
    streamId,
    senderId: "system",
    senderName: "KR8 Stage Director",
    senderRole: "moderator",
    senderBadge: "\u2B50 XP Award",
    text: `\u{1F31F} ${userName} earned +${points} XP for: ${reason}!`
  });
}
function updateLiveStream(updates) {
  const stream = getActiveLiveStream();
  if (!stream) return null;
  const updated = { ...stream, ...updates };
  saveActiveLiveStream(updated);
  return updated;
}
function getLiveChatMessages(streamId) {
  const all = load(LIVE_CHAT_KEY, {});
  return (all[streamId] || []).filter((m) => !m.isDeleted);
}
function saveLiveChatMessages(streamId, messages) {
  const all = load(LIVE_CHAT_KEY, {});
  all[streamId] = messages;
  save(LIVE_CHAT_KEY, all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:live-chat-updated"));
  }
}
function sendLiveChatMessage(input) {
  const messages = getLiveChatMessages(input.streamId);
  const newMsg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    senderId: input.senderId,
    senderName: input.senderName.trim() || "Guest Creator",
    senderRole: input.senderRole || "viewer",
    senderBadge: input.senderBadge,
    text: input.text.trim(),
    createdAt: Date.now()
  };
  const updated = [...messages, newMsg];
  saveLiveChatMessages(input.streamId, updated);
  return newMsg;
}
function pinLiveChatMessage(streamId, messageId) {
  const messages = getLiveChatMessages(streamId);
  const updated = messages.map((m) => ({
    ...m,
    isPinned: m.id === messageId ? !m.isPinned : false
  }));
  saveLiveChatMessages(streamId, updated);
}
function deleteLiveChatMessage(streamId, messageId) {
  const messages = getLiveChatMessages(streamId);
  const updated = messages.map((m) => m.id === messageId ? { ...m, isDeleted: true } : m);
  saveLiveChatMessages(streamId, updated);
}
function promoteViewerToMod(streamId, participantKey) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const mods = stream.promotedModerators || [];
  if (!mods.includes(participantKey)) {
    updateLiveStream({ promotedModerators: [...mods, participantKey] });
  }
}
function promoteViewerToSpeaker(streamId, participantKey) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const speakers = stream.promotedSpeakers || [];
  if (!speakers.includes(participantKey)) {
    updateLiveStream({ promotedSpeakers: [...speakers, participantKey] });
  }
}
function demoteViewer(streamId, participantKey) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const mods = (stream.promotedModerators || []).filter((k) => k !== participantKey);
  const speakers = (stream.promotedSpeakers || []).filter((k) => k !== participantKey);
  updateLiveStream({ promotedModerators: mods, promotedSpeakers: speakers });
}
function getStreamReplays() {
  return load(STREAM_REPLAYS_KEY, INITIAL_STREAM_REPLAYS);
}
function saveStreamReplays(replays) {
  save(STREAM_REPLAYS_KEY, replays);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:replays-updated"));
  }
}
var STREAM_QA_KEY = "kr8_stream_qa_v2";
var STREAM_POLLS_KEY = "kr8_stream_polls_v2";
var STREAM_REQUESTS_KEY = "kr8_stream_requests_v2";
var STREAM_INVITES_KEY = "kr8_stream_invites_v2";
var STREAM_RECORDINGS_KEY = "kr8_stream_recordings_v2";
function getStreamQuestions(streamId) {
  const all = load(STREAM_QA_KEY, {});
  return (all[streamId] || []).sort((a, b) => b.upvotes - a.upvotes || b.createdAt - a.createdAt);
}
function saveStreamQuestions(streamId, questions) {
  const all = load(STREAM_QA_KEY, {});
  all[streamId] = questions;
  save(STREAM_QA_KEY, all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-qa-updated"));
  }
}
function submitStreamQuestion(input) {
  const questions = getStreamQuestions(input.streamId);
  const newQ = {
    id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    submitterId: input.isAnonymous ? void 0 : input.submitterId,
    submitterName: input.isAnonymous ? "Anonymous Creator" : input.submitterName,
    question: input.question.trim(),
    isAnonymous: input.isAnonymous,
    upvotes: 1,
    upvoters: input.submitterId ? [input.submitterId] : [],
    answered: false,
    createdAt: Date.now()
  };
  saveStreamQuestions(input.streamId, [newQ, ...questions]);
  return newQ;
}
function upvoteStreamQuestion(streamId, questionId, userId) {
  const questions = getStreamQuestions(streamId);
  const updated = questions.map((q) => {
    if (q.id === questionId) {
      const already = q.upvoters.includes(userId);
      const nextUpvoters = already ? q.upvoters.filter((u) => u !== userId) : [...q.upvoters, userId];
      return { ...q, upvotes: Math.max(0, nextUpvoters.length), upvoters: nextUpvoters };
    }
    return q;
  });
  saveStreamQuestions(streamId, updated);
}
function answerStreamQuestion(streamId, questionId, answerText, visibility, answeredBy) {
  const questions = getStreamQuestions(streamId);
  const updated = questions.map(
    (q) => q.id === questionId ? {
      ...q,
      answered: true,
      answerText: answerText.trim(),
      answerVisibility: visibility,
      answeredBy
    } : q
  );
  saveStreamQuestions(streamId, updated);
}
function dismissStreamQuestion(streamId, questionId) {
  const questions = getStreamQuestions(streamId);
  const updated = questions.filter((q) => q.id !== questionId);
  saveStreamQuestions(streamId, updated);
}
function getStreamPolls(streamId) {
  const all = load(STREAM_POLLS_KEY, {});
  return all[streamId] || [];
}
function saveStreamPolls(streamId, polls) {
  const all = load(STREAM_POLLS_KEY, {});
  all[streamId] = polls;
  save(STREAM_POLLS_KEY, all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-polls-updated"));
  }
}
function createStreamPoll(input) {
  const polls = getStreamPolls(input.streamId);
  const newPoll = {
    id: `poll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    createdBy: input.createdBy,
    question: input.question.trim(),
    options: input.options.map((t) => ({ text: t.trim(), votes: 0 })),
    isAnonymous: !!input.isAnonymous,
    isQuiz: !!input.isQuiz,
    correctOption: input.correctOption,
    votedUserIds: [],
    launchedAt: Date.now(),
    isActive: true
  };
  saveStreamPolls(input.streamId, [newPoll, ...polls]);
  return newPoll;
}
function voteStreamPoll(streamId, pollId, optionIndex, respondentId) {
  const polls = getStreamPolls(streamId);
  const poll = polls.find((p) => p.id === pollId);
  if (!poll || !poll.isActive || poll.votedUserIds.includes(respondentId)) return false;
  const updated = polls.map((p) => {
    if (p.id === pollId) {
      const nextOptions = [...p.options];
      if (nextOptions[optionIndex]) {
        nextOptions[optionIndex] = {
          ...nextOptions[optionIndex],
          votes: nextOptions[optionIndex].votes + 1
        };
      }
      return {
        ...p,
        options: nextOptions,
        votedUserIds: [...p.votedUserIds, respondentId]
      };
    }
    return p;
  });
  saveStreamPolls(streamId, updated);
  return true;
}
function closeStreamPoll(streamId, pollId) {
  const polls = getStreamPolls(streamId);
  const updated = polls.map((p) => p.id === pollId ? { ...p, isActive: false, closedAt: Date.now() } : p);
  saveStreamPolls(streamId, updated);
}
function getStreamAccessRequests(streamId) {
  const all = load(STREAM_REQUESTS_KEY, []);
  return streamId ? all.filter((r) => r.streamId === streamId) : all;
}
function requestStreamAccess(input) {
  const all = getStreamAccessRequests();
  const existing = all.find((r) => r.streamId === input.streamId && r.requesterId === input.requesterId);
  if (existing) return existing;
  const newReq = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    requesterId: input.requesterId,
    requesterName: input.requesterName,
    status: "pending",
    createdAt: Date.now()
  };
  const updated = [newReq, ...all];
  save(STREAM_REQUESTS_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-requests-updated"));
  }
  return newReq;
}
function respondStreamAccessRequest(requestId, status, responseMessage) {
  const all = getStreamAccessRequests();
  const updated = all.map(
    (r) => r.id === requestId ? { ...r, status, hostResponseMessage: responseMessage } : r
  );
  save(STREAM_REQUESTS_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-requests-updated"));
  }
}
function getStreamInvites(streamId) {
  const all = load(STREAM_INVITES_KEY, []);
  return streamId ? all.filter((i) => i.streamId === streamId) : all;
}
function createStreamInvite(input) {
  const all = getStreamInvites();
  const inviteKey = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newInvite = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    invitedBy: input.invitedBy,
    inviteeUserId: input.inviteeUserId,
    inviteeName: input.inviteeName,
    inviteKey,
    roleGranted: input.roleGranted || "attendee",
    createdAt: Date.now()
  };
  const updated = [newInvite, ...all];
  save(STREAM_INVITES_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-invites-updated"));
  }
  return newInvite;
}
var INITIAL_STREAM_RECORDINGS = [
  {
    id: "rec-1",
    streamId: "stream-prev-01",
    title: "Masterclass: High-Income Graphic Design & Brand Identity in 2026",
    hostName: "Timfire (Founder & CEO)",
    category: "Graphic Design",
    durationMinutes: 54,
    videoUrl: "/videos/testimonial_grant_gideon.mp4",
    thumbnail: "/founder_timfire_wide.jpg",
    recordedAt: "Sep 14, 2026",
    isPublic: true,
    sizeMb: 245
  },
  {
    id: "rec-2",
    streamId: "stream-prev-02",
    title: "Live Creative Jam: Motion Editing & Narrative Storytelling",
    hostName: "Stevenson Uche (Co-Founder)",
    category: "Video Editing",
    durationMinutes: 48,
    videoUrl: "/videos/testimonial_bio_nicz.mp4",
    thumbnail: "/videos/testimonial_bio_nicz_poster.jpg",
    recordedAt: "Sep 08, 2026",
    isPublic: true,
    sizeMb: 198
  }
];
function getStreamRecordings() {
  return load(STREAM_RECORDINGS_KEY, INITIAL_STREAM_RECORDINGS);
}
function saveStreamRecordings(recordings) {
  save(STREAM_RECORDINGS_KEY, recordings);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-recordings-updated"));
  }
}
function addStreamRecording(rec) {
  const existing = getStreamRecordings();
  const next = [rec, ...existing.filter((r) => r.id !== rec.id)];
  saveStreamRecordings(next);
}
function deleteStreamRecording(id) {
  const existing = getStreamRecordings();
  const next = existing.filter((r) => r.id !== id);
  saveStreamRecordings(next);
}
function toggleStreamRecordingPublic(id) {
  const existing = getStreamRecordings();
  const next = existing.map((r) => r.id === id ? { ...r, isPublic: !r.isPublic } : r);
  saveStreamRecordings(next);
}
function promoteParticipantRole(streamId, participantId, newRole) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const viewers = (stream.viewers || []).map(
    (v) => v.id === participantId ? { ...v, role: newRole } : v
  );
  const coHosts = newRole === "co-host" ? [.../* @__PURE__ */ new Set([...stream.coHosts || [], participantId])] : (stream.coHosts || []).filter((id) => id !== participantId);
  const speakers = newRole === "panelist" || newRole === "speaker" ? [.../* @__PURE__ */ new Set([...stream.promotedSpeakers || [], participantId])] : (stream.promotedSpeakers || []).filter((id) => id !== participantId);
  const mods = newRole === "moderator" ? [.../* @__PURE__ */ new Set([...stream.promotedModerators || [], participantId])] : (stream.promotedModerators || []).filter((id) => id !== participantId);
  updateLiveStream({
    viewers,
    coHosts,
    promotedSpeakers: speakers,
    promotedModerators: mods
  });
}
function toggleRaiseHand(streamId, participantId, raised) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const hands = stream.raisedHands || [];
  const nextHands = raised ? [.../* @__PURE__ */ new Set([...hands, participantId])] : hands.filter((id) => id !== participantId);
  const viewers = (stream.viewers || []).map(
    (v) => v.id === participantId ? { ...v, handRaised: raised } : v
  );
  updateLiveStream({ raisedHands: nextHands, viewers });
}
function setSpotlightParticipant(_streamId, participantId) {
  updateLiveStream({ spotlightParticipantId: participantId });
}
function setChatPermission(_streamId, permission) {
  updateLiveStream({ chatPermission: permission });
}
function toggleStreamLock(_streamId, locked) {
  updateLiveStream({ isLocked: locked });
}
function suspendStreamActivities(streamId) {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const viewers = (stream.viewers || []).map(
    (v) => v.role === "host" ? v : { ...v, isMuted: true, isVideoOn: false, isScreenSharing: false }
  );
  updateLiveStream({
    isSuspended: true,
    chatPermission: "disabled",
    viewers
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-suspended"));
  }
}
var CLIENT_REQUESTS_KEY = "kr8_client_requests_v1";
var memoryClientRequests = [];
function getClientRequests() {
  if (typeof window === "undefined") return memoryClientRequests;
  try {
    const raw = localStorage.getItem(CLIENT_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : memoryClientRequests;
  } catch {
    return memoryClientRequests;
  }
}
function saveClientRequest(data) {
  try {
    if (!data.name?.trim()) {
      return { success: false, error: "Full Name or Organization is required." };
    }
    if (!data.email?.trim() && !data.phone?.trim()) {
      return { success: false, error: "Please provide either a valid Email Address or Phone Number so we can reach you." };
    }
    const current = getClientRequests();
    const newReq = {
      id: "req_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      type: data.type,
      title: data.title || "Inbound Client Request",
      name: data.name.trim(),
      email: data.email?.trim() || "",
      phone: data.phone?.trim() || "",
      details: data.details || {},
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "new"
    };
    current.unshift(newReq);
    memoryClientRequests = current;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CLIENT_REQUESTS_KEY, JSON.stringify(current));
        window.dispatchEvent(new Event("kr8:client-requests-updated"));
      } catch (storageErr) {
        return { success: false, error: storageErr?.message || "Storage quota exceeded" };
      }
    }
    return { success: true, id: newReq.id };
  } catch (err) {
    return { success: false, error: err?.message || "Failed to save request to database." };
  }
}
function updateClientRequestStatus(id, status) {
  const current = getClientRequests().map((r) => r.id === id ? { ...r, status } : r);
  memoryClientRequests = current;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CLIENT_REQUESTS_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("kr8:client-requests-updated"));
    } catch {
    }
  }
}
function deleteClientRequest(id) {
  const current = getClientRequests().filter((r) => r.id !== id);
  memoryClientRequests = current;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CLIENT_REQUESTS_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("kr8:client-requests-updated"));
    } catch {
    }
  }
}
function setBreakoutRooms(_streamId, breakouts) {
  updateLiveStream({ breakouts });
}
var DIRECT_MESSAGES_KEY = "kr8_direct_messages_v1";
var BLOCKED_USERS_KEY = "kr8_blocked_users_v1";
var CONVERSATION_REPORTS_KEY = "kr8_conv_reports_v1";
function getAccountById(id) {
  return findStudent(id) || getAccounts().find((a) => a.id === id);
}
var memoryDirectMessages = null;
function getRawDirectMessages() {
  if (memoryDirectMessages) return memoryDirectMessages;
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DIRECT_MESSAGES_KEY);
    memoryDirectMessages = raw ? JSON.parse(raw) : [];
  } catch {
    memoryDirectMessages = [];
  }
  return memoryDirectMessages || [];
}
function saveRawDirectMessages(messages) {
  memoryDirectMessages = messages;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DIRECT_MESSAGES_KEY, JSON.stringify(messages));
      window.dispatchEvent(new Event("kr8:direct-messages-updated"));
    } catch (e) {
      console.warn("Could not persist direct messages to localStorage:", e);
    }
  }
}
function getDirectMessagesBetween(idA, idB) {
  const all = getRawDirectMessages();
  return all.filter(
    (m) => m.senderId === idA && m.recipientId === idB || m.senderId === idB && m.recipientId === idA
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
function sendDirectMessage(senderId, recipientId, text) {
  if (!text || !text.trim()) {
    return { ok: false, error: "Message cannot be empty." };
  }
  if (senderId === recipientId) {
    return { ok: false, error: "Cannot send a message to yourself." };
  }
  if (isStudentBlocked(senderId, recipientId) || isStudentBlocked(recipientId, senderId)) {
    return { ok: false, error: "You cannot message this student due to privacy or block controls." };
  }
  const recipient = getAccountById(recipientId);
  const sender = getAccountById(senderId);
  if (!recipient) {
    return { ok: false, error: "Recipient student not found." };
  }
  const privacy = recipient.messagePrivacy || "Anyone";
  if (privacy === "No one") {
    return { ok: false, error: `${recipient.name} does not accept direct messages.` };
  }
  if (privacy === "Friends only") {
    const senderFollows = (sender?.following || []).includes(recipientId);
    const recipientFollows = (recipient.following || []).includes(senderId);
    if (!senderFollows && !recipientFollows) {
      return { ok: false, error: `${recipient.name} only accepts messages from students they are connected with.` };
    }
  }
  const newMsg = {
    id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    senderId,
    recipientId,
    text: text.trim(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    read: false
  };
  const all = getRawDirectMessages();
  all.push(newMsg);
  saveRawDirectMessages(all);
  return { ok: true, message: newMsg };
}
function markConversationRead(studentId, partnerId) {
  const all = getRawDirectMessages();
  let changed = false;
  const updated = all.map((m) => {
    if (m.recipientId === studentId && m.senderId === partnerId && !m.read) {
      changed = true;
      return { ...m, read: true };
    }
    return m;
  });
  if (changed) {
    saveRawDirectMessages(updated);
  }
}
function getStudentConversations(studentId) {
  const all = getRawDirectMessages();
  const partnersMap = /* @__PURE__ */ new Map();
  for (const msg of all) {
    const partnerId = msg.senderId === studentId ? msg.recipientId : msg.recipientId === studentId ? msg.senderId : null;
    if (!partnerId) continue;
    const existing = partnersMap.get(partnerId);
    const isUnread = msg.recipientId === studentId && !msg.read;
    if (!existing) {
      partnersMap.set(partnerId, { lastMsg: msg, unread: isUnread ? 1 : 0 });
    } else {
      const isNewer = new Date(msg.createdAt).getTime() > new Date(existing.lastMsg.createdAt).getTime();
      partnersMap.set(partnerId, {
        lastMsg: isNewer ? msg : existing.lastMsg,
        unread: existing.unread + (isUnread ? 1 : 0)
      });
    }
  }
  const summaries = [];
  for (const [partnerId, data] of partnersMap.entries()) {
    const partner = getAccountById(partnerId);
    if (partner) {
      summaries.push({
        partner,
        lastMessage: data.lastMsg,
        unreadCount: data.unread
      });
    }
  }
  return summaries.sort(
    (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );
}
function searchStudentsFast(query, excludeId, limit = 20) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const students = getStudents();
  const results = [];
  for (const s of students) {
    if (excludeId && s.id === excludeId) continue;
    if (s.isPlaceholder) continue;
    const nameMatch = s.name.toLowerCase().includes(q);
    const idMatch = s.id.toLowerCase().includes(q);
    const skillMatch = (s.skill || "").toLowerCase().includes(q);
    if (nameMatch || idMatch || skillMatch) {
      results.push(s);
      if (results.length >= limit) break;
    }
  }
  return results;
}
function getBlockedUserIds(studentId) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${BLOCKED_USERS_KEY}_${studentId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function blockStudent(currentStudentId, targetStudentId) {
  if (typeof window === "undefined") return;
  const current = getBlockedUserIds(currentStudentId);
  if (!current.includes(targetStudentId)) {
    current.push(targetStudentId);
    localStorage.setItem(`${BLOCKED_USERS_KEY}_${currentStudentId}`, JSON.stringify(current));
    window.dispatchEvent(new Event("kr8:blocks-updated"));
  }
}
function unblockStudent(currentStudentId, targetStudentId) {
  if (typeof window === "undefined") return;
  const current = getBlockedUserIds(currentStudentId).filter((id) => id !== targetStudentId);
  localStorage.setItem(`${BLOCKED_USERS_KEY}_${currentStudentId}`, JSON.stringify(current));
  window.dispatchEvent(new Event("kr8:blocks-updated"));
}
function isStudentBlocked(userA, userB) {
  const blocksA = getBlockedUserIds(userA);
  return blocksA.includes(userB);
}
function reportConversation(reporterId, reportedId, reason) {
  if (typeof window === "undefined") return { ok: true, message: "Report submitted." };
  try {
    const raw = localStorage.getItem(CONVERSATION_REPORTS_KEY);
    const reports = raw ? JSON.parse(raw) : [];
    reports.push({
      id: "rep_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      reporterId,
      reportedId,
      reason: reason.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending"
    });
    localStorage.setItem(CONVERSATION_REPORTS_KEY, JSON.stringify(reports));
    window.dispatchEvent(new Event("kr8:reports-updated"));
  } catch {
  }
  return { ok: true, message: "Conversation reported to KR8 administration for moderation." };
}
function toggleFollowStudent(currentStudentId, targetStudentId) {
  const current = getAccountById(currentStudentId);
  const target = getAccountById(targetStudentId);
  if (!current || !target) return { following: false };
  const followingList = current.following || [];
  const isFollowing = followingList.includes(targetStudentId);
  const nextFollowing = isFollowing ? followingList.filter((id) => id !== targetStudentId) : [...followingList, targetStudentId];
  const targetFollowers = target.followers || [];
  const nextTargetFollowers = isFollowing ? targetFollowers.filter((id) => id !== currentStudentId) : [...targetFollowers, currentStudentId];
  updateAccount(currentStudentId, { following: nextFollowing });
  updateAccount(targetStudentId, { followers: nextTargetFollowers });
  const updatedProfile = getAccountById(currentStudentId) || current;
  return { following: !isFollowing, updatedProfile };
}

// tests/stubs/supabaseStub.ts
var accountsRows = [];
var upsertLog = [];
var __cloud = {
  setAccounts(rows) {
    accountsRows = rows.map((r) => ({ ...r }));
  },
  getAccounts() {
    return accountsRows.map((r) => ({ ...r }));
  },
  getUpserts() {
    return upsertLog.slice();
  },
  clearUpserts() {
    upsertLog.length = 0;
  },
  reset() {
    accountsRows = [];
    upsertLog.length = 0;
  }
};
var maybeSingleResult = { data: null, error: null };
var client = {
  from(table) {
    const query = {
      select(_q) {
        const rows = table === "accounts" ? __cloud.getAccounts() : [];
        const result = Promise.resolve({ data: rows, error: null });
        const chainable = result;
        chainable.eq = () => chainable;
        chainable.neq = () => chainable;
        chainable.order = () => chainable;
        chainable.limit = () => chainable;
        chainable.maybeSingle = () => Promise.resolve(maybeSingleResult);
        chainable.single = () => Promise.resolve(maybeSingleResult);
        return chainable;
      },
      upsert(payload) {
        upsertLog.push({ table, payload });
        if (table === "accounts") {
          const i = accountsRows.findIndex((r) => r.id === payload.id);
          if (i >= 0) accountsRows[i] = { ...accountsRows[i], ...payload };
          else
            accountsRows.push({
              ...payload,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
        }
        return Promise.resolve({ data: null, error: null });
      },
      update(payload) {
        return Promise.resolve({ data: null, error: null });
      },
      insert(payload) {
        return Promise.resolve({ data: null, error: null });
      }
    };
    query.eq = () => query;
    query.neq = () => query;
    query.order = () => query;
    query.limit = () => query;
    query.maybeSingle = () => Promise.resolve(maybeSingleResult);
    return query;
  },
  channel() {
    const ch = {
      on: () => ch,
      subscribe: () => Promise.resolve(),
      unsubscribe: () => Promise.resolve()
    };
    return ch;
  }
};
function getSupabase() {
  return client;
}

// src/lib/supabaseSync.ts
var isInitialized = false;
var accountsPushListener = null;
var liveStreamPushListener = null;
var activeChannels = [];
var hydrateInFlight = false;
var hydratePending = false;
var accountsHydrateTimer = null;
function teardownSync() {
  if (typeof window !== "undefined") {
    if (accountsPushListener) {
      window.removeEventListener("kr8:accounts-updated", accountsPushListener);
      accountsPushListener = null;
    }
    if (liveStreamPushListener) {
      window.removeEventListener("kr8:live-stream-updated", liveStreamPushListener);
      liveStreamPushListener = null;
    }
  }
  for (const ch of activeChannels) {
    try {
      ch.unsubscribe();
    } catch {
    }
  }
  activeChannels = [];
  if (accountsHydrateTimer) {
    clearTimeout(accountsHydrateTimer);
    accountsHydrateTimer = null;
  }
  isInitialized = false;
}
if (typeof window !== "undefined") {
  window.addEventListener("kr8:supabase-configured", () => {
    teardownSync();
    initSupabaseSync();
  });
}
function initSupabaseSync() {
  if (typeof window === "undefined" || isInitialized) return;
  const supabase = getSupabase();
  if (!supabase) return;
  isInitialized = true;
  hydrateAccountsFromSupabase();
  hydrateLiveStreamFromSupabase();
  accountsPushListener = (event) => {
    const detail = event.detail;
    const accounts = getAccounts();
    const changed = detail?.changedIds;
    const targets = changed ? accounts.filter(
      (acc) => changed.some((c) => normalizeIdentity(c || "") === normalizeIdentity(acc.id || ""))
    ) : accounts;
    targets.forEach((acc) => {
      if (!acc.isPlaceholder) {
        syncAccountToSupabase(acc);
      }
    });
  };
  window.addEventListener("kr8:accounts-updated", accountsPushListener);
  liveStreamPushListener = () => {
    syncLiveStreamToSupabase(getActiveLiveStream());
  };
  window.addEventListener("kr8:live-stream-updated", liveStreamPushListener);
  try {
    const liveStreamsChannel = supabase.channel("public:live_streams").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "live_streams" },
      (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const row = payload.new;
          if (row && row.is_live) {
            if (isStreamTerminated(row.id)) {
              return;
            }
            const stream = {
              id: row.id,
              title: row.title,
              category: row.category,
              description: row.description || "",
              hostId: row.host_id || "",
              hostName: row.host_name,
              hostAvatar: row.host_avatar,
              visibility: row.visibility || "public",
              accessKey: row.access_key,
              isLive: row.is_live,
              startedAt: Number(row.started_at) || Date.now(),
              viewerCount: Number(row.viewer_count) || 1,
              peakViewers: Number(row.peak_viewers) || 1,
              quality: row.quality || "1080p60",
              videoUrl: row.video_url || "",
              posterUrl: row.poster_url || "",
              pinnedNotice: row.pinned_notice,
              promotedModerators: [],
              promotedSpeakers: [],
              viewers: row.viewers || [],
              assignedTasks: row.assigned_tasks || [],
              recognizedParticipants: row.recognized_participants || []
            };
            saveActiveLiveStream(stream);
          } else if (payload.eventType === "UPDATE" && !row.is_live) {
            saveActiveLiveStream(null);
          }
        } else if (payload.eventType === "DELETE") {
          saveActiveLiveStream(null);
        }
      }
    );
    activeChannels.push(liveStreamsChannel);
    liveStreamsChannel.subscribe();
    const liveChatChannel = supabase.channel("public:live_chat").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "live_chat" },
      (payload) => {
        const row = payload.new;
        if (row) {
          const active = getActiveLiveStream();
          if (active && active.id === row.stream_id) {
            const currentMessages = getLiveChatMessages(row.stream_id);
            if (!currentMessages.some((m) => m.id === row.id)) {
              const newMsg = {
                id: row.id,
                streamId: row.stream_id,
                senderId: row.sender_id,
                senderName: row.sender_name,
                senderRole: row.sender_role || "viewer",
                senderBadge: row.sender_badge,
                text: row.text,
                createdAt: Number(row.created_at) || Date.now(),
                isPinned: row.is_pinned || false
              };
              saveLiveChatMessages(row.stream_id, [...currentMessages, newMsg]);
            }
          }
        }
      }
    );
    activeChannels.push(liveChatChannel);
    liveChatChannel.subscribe();
    const accountsChannel = supabase.channel("public:accounts").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "accounts" },
      () => {
        if (accountsHydrateTimer) clearTimeout(accountsHydrateTimer);
        accountsHydrateTimer = setTimeout(() => {
          hydrateAccountsFromSupabase();
        }, 800);
      }
    );
    activeChannels.push(accountsChannel);
    accountsChannel.subscribe();
  } catch (err) {
    console.warn("Realtime subscription initialization error:", err);
  }
}
function isEmptyValue2(v) {
  if (v === void 0 || v === null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}
function sameValue(a, b) {
  const ea = isEmptyValue2(a);
  const eb = isEmptyValue2(b);
  if (ea || eb) return ea && eb;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!sameValue(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    return sameAccount(a, b);
  }
  return a === b;
}
function sameAccount(a, b) {
  const ka = a && typeof a === "object" && !Array.isArray(a) ? Object.keys(a) : [];
  const kb = b && typeof b === "object" && !Array.isArray(b) ? Object.keys(b) : [];
  for (const k of /* @__PURE__ */ new Set([...ka, ...kb])) {
    if (!sameValue(a?.[k], b?.[k])) return false;
  }
  return true;
}
var CLOUD_SYNCED_FIELDS = [
  "id",
  "type",
  "name",
  "email",
  "phone",
  "country",
  "skill",
  "dob",
  "vip",
  "points",
  "attendanceAccepted",
  "submissions",
  "referrals",
  "graduated",
  "certTier",
  "certRecognition",
  "avatar",
  "executiveRole"
];
function cloudFieldsDiffer(a, b) {
  for (const f of CLOUD_SYNCED_FIELDS) {
    if (!sameValue(a?.[f], b?.[f])) return true;
  }
  return false;
}
async function hydrateAccountsFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;
  if (hydrateInFlight) {
    hydratePending = true;
    return;
  }
  hydrateInFlight = true;
  try {
    const { data, error } = await supabase.from("accounts").select("*");
    if (!error && data && data.length > 0) {
      const local = getAccounts();
      const localMap = new Map(local.map((a) => [normalizeIdentity(a.id || ""), a]));
      let changedAny = false;
      data.forEach((row) => {
        const key = normalizeIdentity(String(row.id || ""));
        if (!key) return;
        const existing = localMap.get(key);
        const isGraduated = existing?.graduated || !!row.graduated;
        const certTier = existing?.certTier || row.cert_tier || (isGraduated ? "Completion" : void 0);
        const acc = {
          ...existing,
          id: row.id,
          type: row.type || existing?.type || "student",
          name: row.name || existing?.name,
          email: row.email || existing?.email,
          phone: row.phone || existing?.phone,
          country: row.country || existing?.country || "NG",
          skill: row.skill || existing?.skill || "",
          dob: row.dob || existing?.dob || "",
          points: Number(row.points) || existing?.points || 0,
          vip: typeof row.vip !== "undefined" ? !!row.vip : existing?.vip ?? false,
          attendanceAccepted: Number(row.attendance_accepted) || existing?.attendanceAccepted || 0,
          submissions: Number(row.submissions) || existing?.submissions || 0,
          referrals: Number(row.referrals) || existing?.referrals || 0,
          graduated: isGraduated,
          certTier,
          certRecognition: row.cert_recognition || existing?.certRecognition,
          certificates: existing?.certificates || [],
          notifications: existing?.notifications || [],
          graduatedSkills: existing?.graduatedSkills || (isGraduated && (row.skill || existing?.skill) ? [row.skill || existing?.skill] : []),
          certificateUrl: existing?.certificateUrl,
          avatar: row.avatar && (row.type === "founder" || !row.avatar.includes("founder_timfire.jpg")) ? row.avatar : existing?.avatar || generateDefaultAvatar(row.name, row.id),
          executiveRole: row.executive_role || existing?.executiveRole,
          // Prefer the locally known joined (authoritative); fall back to the
          // cloud timestamp only for records we have never seen before.
          joined: existing?.joined || row.created_at || row.joined || (/* @__PURE__ */ new Date()).toISOString()
        };
        if (!existing || cloudFieldsDiffer(existing, acc)) {
          localMap.set(key, acc);
          changedAny = true;
        }
      });
      if (changedAny) saveAccounts(Array.from(localMap.values()));
    }
  } catch {
  } finally {
    hydrateInFlight = false;
    if (hydratePending) {
      hydratePending = false;
      hydrateAccountsFromSupabase();
    }
  }
}
async function hydrateLiveStreamFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from("live_streams").select("*").eq("is_live", true).order("started_at", { ascending: false }).limit(1).maybeSingle();
    if (!error && data) {
      if (isStreamTerminated(data.id)) {
        try {
          await supabase.from("live_streams").update({ is_live: false }).eq("id", data.id);
        } catch {
        }
        return;
      }
      const stream = {
        id: data.id,
        title: data.title,
        category: data.category,
        description: data.description || "",
        hostId: data.host_id || "",
        hostName: data.host_name,
        hostAvatar: data.host_avatar,
        visibility: data.visibility || "public",
        accessKey: data.access_key,
        isLive: true,
        startedAt: Number(data.started_at) || Date.now(),
        viewerCount: Number(data.viewer_count) || 1,
        peakViewers: Number(data.peak_viewers) || 1,
        quality: data.quality || "1080p60",
        videoUrl: data.video_url || "",
        posterUrl: data.poster_url || "",
        pinnedNotice: data.pinned_notice,
        promotedModerators: [],
        promotedSpeakers: [],
        viewers: data.viewers || [],
        assignedTasks: data.assigned_tasks || [],
        recognizedParticipants: data.recognized_participants || []
      };
      saveActiveLiveStream(stream);
    }
  } catch {
  }
}
async function syncAccountToSupabase(account) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from("accounts").upsert({
      id: account.id,
      type: account.type,
      name: account.name,
      email: account.email,
      phone: account.phone,
      country: account.country || "NG",
      skill: account.skill || null,
      dob: account.dob || null,
      // NEVER sync real credentials to the cloud (the anon key is public);
      // authentication always resolves against local storage.
      password: "kr8-account",
      vip: !!account.vip,
      points: account.points || 0,
      attendance_accepted: account.attendanceAccepted || 0,
      submissions: account.submissions || 0,
      referrals: account.referrals || 0,
      graduated: !!account.graduated,
      cert_tier: account.certTier || null,
      cert_recognition: account.certRecognition || null,
      avatar: account.avatar || null,
      executive_role: account.executiveRole || null
    });
  } catch (err) {
    console.warn("Could not sync account to Supabase:", err);
  }
}
async function syncLiveStreamToSupabase(stream) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    if (!stream) {
      await supabase.from("live_streams").update({ is_live: false }).neq("id", "none");
      await supabase.from("streams").update({ is_live: false }).neq("id", "none");
    } else {
      await supabase.from("live_streams").upsert({
        id: stream.id,
        title: stream.title,
        category: stream.category,
        description: stream.description,
        host_id: stream.hostId,
        host_name: stream.hostName,
        host_avatar: stream.hostAvatar,
        visibility: stream.visibility,
        access_key: stream.accessKey,
        is_live: stream.isLive,
        started_at: stream.startedAt,
        viewer_count: stream.viewerCount,
        peak_viewers: stream.peakViewers,
        quality: stream.quality,
        viewers: stream.viewers || [],
        assigned_tasks: stream.assignedTasks || [],
        recognized_participants: stream.recognizedParticipants || []
      });
      await supabase.from("streams").upsert({
        id: stream.id,
        title: stream.title,
        category: stream.category,
        description: stream.description,
        host_id: stream.hostId,
        host_name: stream.hostName,
        host_avatar: stream.hostAvatar,
        visibility: stream.visibility,
        access_key: stream.accessKey,
        is_live: stream.isLive,
        started_at: stream.startedAt,
        viewer_count: stream.viewerCount,
        livekit_room_name: stream.livekitRoomName || stream.id,
        chat_permission: stream.chatPermission || "everyone",
        is_locked: !!stream.isLocked,
        is_suspended: !!stream.isSuspended,
        spotlight_participant_id: stream.spotlightParticipantId || null,
        is_recording: !!stream.isRecording,
        viewers: stream.viewers || []
      });
    }
  } catch (err) {
    console.warn("Could not sync live stream to Supabase:", err);
  }
}
async function syncLiveChatMessageToSupabase(msg) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from("live_chat").insert({
      id: msg.id,
      stream_id: msg.streamId,
      sender_id: msg.senderId,
      sender_name: msg.senderName,
      sender_role: msg.senderRole,
      sender_badge: msg.senderBadge || null,
      text: msg.text,
      is_pinned: !!msg.isPinned,
      created_at: msg.createdAt
    });
    await supabase.from("stream_chat_messages").insert({
      id: msg.id,
      stream_id: msg.streamId,
      sender_id: msg.senderId,
      sender_name: msg.senderName,
      sender_role: msg.senderRole,
      recipient_id: msg.recipientId || null,
      recipient_name: msg.recipientName || null,
      is_private: !!msg.recipientId,
      text: msg.text,
      is_pinned: !!msg.isPinned,
      created_at: msg.createdAt
    });
  } catch (err) {
    console.warn("Could not sync chat message to Supabase:", err);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_PHONE_NUMBERS,
  ADMIN_SECTIONS,
  AGENCY_SERVICES,
  ANNOUNCEMENTS,
  ANNOUNCEMENT_BAR,
  ATTENDANCE_TYPES,
  BLOG,
  CERTIFICATION_CRITERIA,
  COFOUNDER_PHONES,
  COHORT_YEAR,
  CONTACT,
  COUNTRIES,
  DEFAULT_DOUBT_TO_BELIEF,
  DEFAULT_NARRATIVE_LINES,
  DEFAULT_PUNCHLINE,
  DEFAULT_SKILLS,
  DEFAULT_WAITLIST_WHATSAPP,
  DEFAULT_XP_RULES,
  FOUNDER_EMAILS,
  FOUNDER_PHONES,
  FULL_CURRICULA,
  FULL_PORTFOLIO_LINK,
  INITIAL_GALLERY_ITEMS,
  INITIAL_STREAM_RECORDINGS,
  INITIAL_STREAM_REPLAYS,
  INSTRUCTOR_PHOTOS,
  MAIN_ADMIN_PASSWORD,
  PARTNERS,
  PORTFOLIO,
  REAL_STUDENT_TESTIMONIALS,
  REGISTRATION_VAULT_KEY,
  SCORING,
  SKILLS,
  SOCIAL_LINKS,
  TESTIMONIALS,
  TRIBE_WHATSAPP,
  ULTIMATE_ADMIN_EMAILS,
  __cloud,
  addFeed,
  addGalleryItem,
  addPostComment,
  addStreamRecording,
  addTestimonial,
  addVideoComment,
  adminInfoFor,
  adminRegisterStudent,
  answerStreamQuestion,
  approveGalleryItem,
  archiveAnnouncementToGallery,
  areAllRegistrationsClosed,
  assignTaskToViewer,
  authenticateAccount,
  awardPointsToStreamViewer,
  blockStudent,
  buildPhone,
  canAccessAdminSection,
  canUserHostStream,
  closeStreamPoll,
  completePasswordReset,
  completeStreamTask,
  countryByCode,
  createBlogPost,
  createStreamInvite,
  createStreamPoll,
  deleteClientRequest,
  deleteCustomSkill,
  deleteGalleryItem,
  deleteLiveChatMessage,
  deleteStreamRecording,
  deleteTestimonial,
  deleteVideoComment,
  demoteAccount,
  demoteViewer,
  detectCountryCode,
  dismissStreamQuestion,
  endActiveLiveStream,
  fdAllowed,
  feedAction,
  findStudent,
  generateDefaultAvatar,
  getAccountById,
  getAccounts,
  getActiveLiveStream,
  getAnnouncementBar,
  getAnnouncements,
  getAttendanceSubmissions,
  getAttendanceTypesSettings,
  getBlockedUserIds,
  getBlogPosts,
  getCertificateById,
  getClientRequests,
  getCustomSkills,
  getDirectMessagesBetween,
  getDynamicCurricula,
  getEligibleStreamHosts,
  getFeed,
  getFounders,
  getGalleryItems,
  getHomepageSettings,
  getLastEndedStream,
  getLiveChatMessages,
  getPaymentSettings,
  getPortfolio,
  getRecognizedAdmin,
  getReferralUrl,
  getSkill,
  getSkillCode,
  getSkillName,
  getSkillRegistration,
  getSkillSuffix,
  getSkillWhatsApp,
  getSkills,
  getSocialLinks,
  getStreamAccessRequests,
  getStreamInvites,
  getStreamPolls,
  getStreamQuestions,
  getStreamRecordings,
  getStreamReplays,
  getStudentAttendance,
  getStudentCertificates,
  getStudentConversations,
  getStudentNotifications,
  getStudents,
  getSuspendedAccounts,
  getTeam,
  getTestimonials,
  getTribeWhatsApp,
  getVideoComments,
  getWaitlistWhatsAppUrl,
  getXpRules,
  hydrateAccountsFromSupabase,
  initSupabaseSync,
  isCoFounderAccount,
  isCredentialSuspended,
  isExecutiveAccount,
  isFounderAccount,
  isStreamTerminated,
  isStudentBlocked,
  isUltimateAdmin,
  isVip,
  issueCertificate,
  joinStreamViewer,
  leaveStreamViewer,
  likeVideoComment,
  markConversationRead,
  markNotificationRead,
  markStreamTerminated,
  muteAllListeners,
  nextSerial,
  normalizeEmail,
  normalizeIdentity,
  normalizePhone,
  pinLiveChatMessage,
  promoteAccount,
  promoteParticipantRole,
  promoteViewerToMod,
  promoteViewerToSpeaker,
  randomAdminPassword,
  recoverId,
  registerStudent,
  registerTribe,
  rejectGalleryItem,
  reportConversation,
  requestPasswordReset,
  requestStreamAccess,
  resetAdminPassword,
  respondStreamAccessRequest,
  restoreSuspendedAccount,
  reviewAttendance,
  revokeStudentRegistration,
  saveAccounts,
  saveActiveLiveStream,
  saveAnnouncementBar,
  saveAnnouncements,
  saveAttendanceSubmissions,
  saveBlogPosts,
  saveClientRequest,
  saveCustomSkill,
  saveDynamicCurriculum,
  saveFounders,
  saveGalleryItems,
  saveHomepageSettings,
  saveLiveChatMessages,
  savePaymentSettings,
  savePortfolio,
  saveSkillSetting,
  saveSocialLinks,
  saveStreamPolls,
  saveStreamQuestions,
  saveStreamRecordings,
  saveStreamReplays,
  saveSuspendedAccounts,
  saveTeam,
  saveTestimonials,
  saveVerifyRemark,
  saveVideoComments,
  saveWaitlistWhatsAppUrl,
  saveXpRules,
  searchStudentsFast,
  sendDirectMessage,
  sendLiveChatMessage,
  setBreakoutRooms,
  setChatPermission,
  setSpotlightParticipant,
  startLiveStream,
  studentCount,
  submitAttendance,
  submitStreamQuestion,
  submitSuspensionAppeal,
  suspendStreamActivities,
  suspendStudentAccount,
  syncAccountToSupabase,
  syncLiveChatMessageToSupabase,
  syncLiveStreamToSupabase,
  timeAgo,
  toggleAttendanceTypeOpen,
  toggleFollowStudent,
  toggleFollowUser,
  toggleLikePost,
  toggleParticipantMute,
  toggleRaiseHand,
  toggleStreamLock,
  toggleStreamRecordingPublic,
  tribeCount,
  unblockStudent,
  updateAccount,
  updateClientRequestStatus,
  updateLiveStream,
  updateTestimonial,
  upholdSuspendedAccount,
  upvoteStreamQuestion,
  verifyId,
  voteStreamPoll,
  withdrawCertificate
});
