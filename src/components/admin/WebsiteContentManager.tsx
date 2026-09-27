import { useState, useEffect } from "react";
import { getSiteContent, saveSiteContent, resetSiteContent, type SiteContent } from "../../data/cmsStore";
import { Card } from "../ui";
import Icon from "../Icon";

type SubSection = "home" | "academy" | "agency" | "tribe" | "partner" | "about" | "global";

const SUB_SECTIONS: { id: SubSection; label: string; icon: string }[] = [
  { id: "home", label: "Home Page", icon: "spark" },
  { id: "academy", label: "Academy Page", icon: "book" },
  { id: "agency", label: "Agency Page", icon: "briefcase" },
  { id: "tribe", label: "Tribe Page", icon: "users" },
  { id: "partner", label: "Partner Page", icon: "heart" },
  { id: "about", label: "About Page", icon: "user" },
  { id: "global", label: "Global & Footer", icon: "bolt" },
];

const inputCls = "w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none transition-all";
const textareaCls = "w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none transition-all min-h-[75px]";
const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1.5";

export default function WebsiteContentManager() {
  const [content, setContent] = useState<SiteContent>(getSiteContent());
  const [activeSub, setActiveSub] = useState<SubSection>("home");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setContent(getSiteContent());
    window.addEventListener("kr8:cms-updated", sync);
    return () => window.removeEventListener("kr8:cms-updated", sync);
  }, []);

  const handleSave = () => {
    saveSiteContent(content);
    setStatusMsg("Website content updated and published successfully!");
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to restore default website copy? Any custom edits will be reset.")) {
      const def = resetSiteContent();
      setContent(def);
      setStatusMsg("Restored default website content copy.");
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const updateGlobal = (key: keyof SiteContent["global"], val: any) => {
    setContent((prev) => ({
      ...prev,
      global: { ...prev.global, [key]: val },
    }));
  };

  const updateHome = (key: keyof SiteContent["home"], val: string) => {
    setContent((prev) => ({
      ...prev,
      home: { ...prev.home, [key]: val },
    }));
  };

  const updateAcademy = (key: keyof SiteContent["academy"], val: string) => {
    setContent((prev) => ({
      ...prev,
      academy: { ...prev.academy, [key]: val },
    }));
  };

  const updateAgency = (key: keyof SiteContent["agency"], val: string) => {
    setContent((prev) => ({
      ...prev,
      agency: { ...prev.agency, [key]: val },
    }));
  };

  const updateTribe = (key: keyof SiteContent["tribe"], val: string) => {
    setContent((prev) => ({
      ...prev,
      tribe: { ...prev.tribe, [key]: val },
    }));
  };

  const updatePartner = (key: keyof SiteContent["partner"], val: string) => {
    setContent((prev) => ({
      ...prev,
      partner: { ...prev.partner, [key]: val },
    }));
  };

  const updateAbout = (key: keyof SiteContent["about"], val: string) => {
    setContent((prev) => ({
      ...prev,
      about: { ...prev.about, [key]: val },
    }));
  };

  return (
    <div className="space-y-6">
      {/* CMS Header & Top Actions */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
                <Icon name="spark" size={16} />
              </span>
              <span>Website Content CMS (Live Powerhouse)</span>
            </h2>
            <p className="mt-1 text-xs text-[#b8aecf]">
              Dynamically manage headlines, descriptions, CTAs, button links, and page narratives across every section of KR8 Digitals without editing source code.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleReset}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-[#cabfe0] hover:bg-white/5 transition-all"
            >
              Restore Defaults
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all"
            >
              <Icon name="check" size={14} />
              <span>Save & Publish Live</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 px-4 py-2.5 text-xs font-semibold text-emerald-300 animate-fadeIn">
            ✓ {statusMsg}
          </div>
        )}

        {/* Sub-Section Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {SUB_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSub(sec.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSub === sec.id
                  ? "bg-pink-600/30 text-pink-300 border border-pink-500/40"
                  : "text-[#a89ec4] hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* SUB-SECTION 1: HOME PAGE */}
      {activeSub === "home" && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-pink-400">✦</span> Home Hero Section
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Top Announcement Pill / Badge</label>
                <input
                  type="text"
                  value={content.home.heroBadge}
                  onChange={(e) => updateHome("heroBadge", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Main Hero Headline</label>
                <input
                  type="text"
                  value={content.home.heroHeadline}
                  onChange={(e) => updateHome("heroHeadline", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Hero Supporting Subheadline</label>
                <textarea
                  value={content.home.heroSubheadline}
                  onChange={(e) => updateHome("heroSubheadline", e.target.value)}
                  className={textareaCls}
                />
              </div>
              <div>
                <label className={labelCls}>Primary CTA Button Text</label>
                <input
                  type="text"
                  value={content.home.primaryCtaText}
                  onChange={(e) => updateHome("primaryCtaText", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Primary CTA Route / Link</label>
                <input
                  type="text"
                  value={content.home.primaryCtaLink}
                  onChange={(e) => updateHome("primaryCtaLink", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Secondary CTA Button Text</label>
                <input
                  type="text"
                  value={content.home.secondaryCtaText}
                  onChange={(e) => updateHome("secondaryCtaText", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Secondary CTA Route / Link</label>
                <input
                  type="text"
                  value={content.home.secondaryCtaLink}
                  onChange={(e) => updateHome("secondaryCtaLink", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-pink-400">✦</span> Home Key Statistics Cards
            </h3>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className={labelCls}>Students Trained</label>
                <input
                  type="text"
                  value={content.home.statsTrained}
                  onChange={(e) => updateHome("statsTrained", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Projects Delivered</label>
                <input
                  type="text"
                  value={content.home.statsProjects}
                  onChange={(e) => updateHome("statsProjects", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Cohorts Run</label>
                <input
                  type="text"
                  value={content.home.statsCohorts}
                  onChange={(e) => updateHome("statsCohorts", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Satisfaction Rate</label>
                <input
                  type="text"
                  value={content.home.statsSatisfaction}
                  onChange={(e) => updateHome("statsSatisfaction", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-pink-400">✦</span> Home About & Movement Story
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Section Headline</label>
                <input
                  type="text"
                  value={content.home.aboutHeadline}
                  onChange={(e) => updateHome("aboutHeadline", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Lead Paragraph (Mission Context)</label>
                <textarea
                  value={content.home.aboutParagraph1}
                  onChange={(e) => updateHome("aboutParagraph1", e.target.value)}
                  className={textareaCls}
                />
              </div>
              <div>
                <label className={labelCls}>Secondary Paragraph (Student Outcomes)</label>
                <textarea
                  value={content.home.aboutParagraph2}
                  onChange={(e) => updateHome("aboutParagraph2", e.target.value)}
                  className={textareaCls}
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-pink-400">✦</span> Home Bottom Call-To-Action Banner
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>CTA Headline</label>
                <input
                  type="text"
                  value={content.home.ctaHeadline}
                  onChange={(e) => updateHome("ctaHeadline", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>CTA Subtitle / Description</label>
                <textarea
                  value={content.home.ctaSubtitle}
                  onChange={(e) => updateHome("ctaSubtitle", e.target.value)}
                  className={textareaCls}
                />
              </div>
              <div>
                <label className={labelCls}>Button Text</label>
                <input
                  type="text"
                  value={content.home.ctaButtonText}
                  onChange={(e) => updateHome("ctaButtonText", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Button Link</label>
                <input
                  type="text"
                  value={content.home.ctaButtonLink}
                  onChange={(e) => updateHome("ctaButtonLink", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SUB-SECTION 2: ACADEMY */}
      {activeSub === "academy" && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">✦</span> Academy Page Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Hero Badge</label>
              <input
                type="text"
                value={content.academy.heroBadge}
                onChange={(e) => updateAcademy("heroBadge", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Hero Headline</label>
              <input
                type="text"
                value={content.academy.heroHeadline}
                onChange={(e) => updateAcademy("heroHeadline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Hero Subtitle</label>
              <textarea
                value={content.academy.heroSubtitle}
                onChange={(e) => updateAcademy("heroSubtitle", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Apply Button Text</label>
                <input
                  type="text"
                  value={content.academy.applyCtaText}
                  onChange={(e) => updateAcademy("applyCtaText", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Apply Button Link</label>
                <input
                  type="text"
                  value={content.academy.applyCtaLink}
                  onChange={(e) => updateAcademy("applyCtaLink", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Trust & Guarantee Banner Text</label>
              <input
                type="text"
                value={content.academy.guaranteeText}
                onChange={(e) => updateAcademy("guaranteeText", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </Card>
      )}

      {/* SUB-SECTION 3: AGENCY */}
      {activeSub === "agency" && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">✦</span> Agency Page Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Hero Badge</label>
              <input
                type="text"
                value={content.agency.heroBadge}
                onChange={(e) => updateAgency("heroBadge", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Agency Headline</label>
              <input
                type="text"
                value={content.agency.heroHeadline}
                onChange={(e) => updateAgency("heroHeadline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Agency Subtitle</label>
              <textarea
                value={content.agency.heroSubtitle}
                onChange={(e) => updateAgency("heroSubtitle", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className={labelCls}>Bottom CTA Headline</label>
              <input
                type="text"
                value={content.agency.ctaHeadline}
                onChange={(e) => updateAgency("ctaHeadline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Bottom CTA Subtitle</label>
              <textarea
                value={content.agency.ctaSubtitle}
                onChange={(e) => updateAgency("ctaSubtitle", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className={labelCls}>Proposal Button Text</label>
              <input
                type="text"
                value={content.agency.ctaButtonText}
                onChange={(e) => updateAgency("ctaButtonText", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </Card>
      )}

      {/* SUB-SECTION 4: TRIBE */}
      {activeSub === "tribe" && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">✦</span> Tribe Page Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Hero Badge</label>
              <input
                type="text"
                value={content.tribe.heroBadge}
                onChange={(e) => updateTribe("heroBadge", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Tribe Headline</label>
              <input
                type="text"
                value={content.tribe.heroHeadline}
                onChange={(e) => updateTribe("heroHeadline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Tribe Subtitle</label>
              <textarea
                value={content.tribe.heroSubtitle}
                onChange={(e) => updateTribe("heroSubtitle", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className={labelCls}>Join CTA Button Text</label>
              <input
                type="text"
                value={content.tribe.ctaText}
                onChange={(e) => updateTribe("ctaText", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Community Channels Notice</label>
              <input
                type="text"
                value={content.tribe.communityNotice}
                onChange={(e) => updateTribe("communityNotice", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </Card>
      )}

      {/* SUB-SECTION 5: PARTNER */}
      {activeSub === "partner" && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">✦</span> Partner Page Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Hero Badge</label>
              <input
                type="text"
                value={content.partner.heroBadge}
                onChange={(e) => updatePartner("heroBadge", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Partnership Headline</label>
              <input
                type="text"
                value={content.partner.heroHeadline}
                onChange={(e) => updatePartner("heroHeadline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Partnership Subtitle</label>
              <textarea
                value={content.partner.heroSubtitle}
                onChange={(e) => updatePartner("heroSubtitle", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className={labelCls}>Proposal Form Headline</label>
              <input
                type="text"
                value={content.partner.formHeadline}
                onChange={(e) => updatePartner("formHeadline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Proposal Form Subtitle</label>
              <input
                type="text"
                value={content.partner.formSubtitle}
                onChange={(e) => updatePartner("formSubtitle", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </Card>
      )}

      {/* SUB-SECTION 6: ABOUT */}
      {activeSub === "about" && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">✦</span> About Us Page Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Hero Headline</label>
              <input
                type="text"
                value={content.about.heroHeadline}
                onChange={(e) => updateAbout("heroHeadline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Hero Subtitle</label>
              <textarea
                value={content.about.heroSubtitle}
                onChange={(e) => updateAbout("heroSubtitle", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className={labelCls}>Mission Statement</label>
              <textarea
                value={content.about.missionText}
                onChange={(e) => updateAbout("missionText", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className={labelCls}>Vision Statement</label>
              <textarea
                value={content.about.visionText}
                onChange={(e) => updateAbout("visionText", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div>
              <label className={labelCls}>Founder Executive Quote</label>
              <textarea
                value={content.about.founderQuote}
                onChange={(e) => updateAbout("founderQuote", e.target.value)}
                className={textareaCls}
              />
            </div>
          </div>
        </Card>
      )}

      {/* SUB-SECTION 7: GLOBAL & FOOTER */}
      {activeSub === "global" && (
        <Card>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">✦</span> Global Brand & Contact Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Official Brand Name</label>
              <input
                type="text"
                value={content.global.siteName}
                onChange={(e) => updateGlobal("siteName", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Brand Tagline / Slogan</label>
              <input
                type="text"
                value={content.global.tagline}
                onChange={(e) => updateGlobal("tagline", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Official Support Email</label>
              <input
                type="email"
                value={content.global.supportEmail}
                onChange={(e) => updateGlobal("supportEmail", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Official Support Phone</label>
              <input
                type="text"
                value={content.global.supportPhone}
                onChange={(e) => updateGlobal("supportPhone", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>WhatsApp Official Number</label>
              <input
                type="text"
                value={content.global.whatsappNumber}
                onChange={(e) => updateGlobal("whatsappNumber", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Headquarters / Physical Address</label>
              <input
                type="text"
                value={content.global.address}
                onChange={(e) => updateGlobal("address", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Footer Brand Description</label>
              <textarea
                value={content.global.footerText}
                onChange={(e) => updateGlobal("footerText", e.target.value)}
                className={textareaCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Footer Copyright Line</label>
              <input
                type="text"
                value={content.global.copyrightText}
                onChange={(e) => updateGlobal("copyrightText", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
