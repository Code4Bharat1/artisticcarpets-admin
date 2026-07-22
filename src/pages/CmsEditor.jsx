import React, { useState, useEffect } from "react";
import { apiRequest } from "../services/api";
import { 
  FileText, 
  Grid, 
  BookOpen, 
  Star, 
  Lock, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Edit2
} from "lucide-react";

export default function CmsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("collections");

  // CMS state for "homepage" page config
  const [pageTitle, setPageTitle] = useState("Homepage Configuration");
  const [collections, setCollections] = useState([]);
  const [collectionsHeader, setCollectionsHeader] = useState({ title: "", subtitle: "" });
  
  const [highlightsHeader, setHighlightsHeader] = useState({ title: "", subtitle: "" });
  
  const [journalArticles, setJournalArticles] = useState([]);
  const [journalHeader, setJournalHeader] = useState({ title: "", subtitle: "" });

  const fetchCmsData = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await apiRequest.get("/cms/homepage");
      if (data.success && data.page && data.page.sections && data.page.sections.length > 0) {
        parsePageSections(data.page);
      } else {
        loadStaticDefaults();
      }
    } catch (err) {
      setError("Failed to fetch CMS page. Operating in fallback mode.");
      loadStaticDefaults();
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const loadStaticDefaults = () => {
    setCollectionsHeader({
      title: "Explore Our Collections",
      subtitle: "Crafted for every space, inspired by centuries of artistry."
    });
    setCollections([
      {
        id: "persian-rugs",
        name: "Persian Rugs",
        description: "Hand-knotted masterpieces inspired by centuries of heritage.",
        count: "124 Products",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwkZ-8Xama4gfHG2H9s9vunhksD5kK_ukjgQDQSIsojw&s=10",
        link: "#"
      },
      {
        id: "modern-rugs",
        name: "Modern Rugs",
        description: "Contemporary designs crafted for elegant living spaces.",
        count: "86 Products",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjtJjEy9j8D1SEREGlqErs7sx2EzlWh15Pw3UU_P-nPw&s=10",
        link: "#"
      },
      {
        id: "vintage-rugs",
        name: "Vintage Rugs",
        description: "Beautifully aged pieces with timeless character.",
        count: "58 Products",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        link: "#"
      },
      {
        id: "outdoor-rugs",
        name: "Outdoor Rugs",
        description: "Durable luxury rugs made for indoor and outdoor living.",
        count: "43 Products",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        link: "#"
      }
    ]);

    setHighlightsHeader({
      title: "Curated Highlights",
      subtitle: "Hand-selected masterpieces from our latest arrivals."
    });

    setJournalHeader({
      title: "From Our Journal",
      subtitle: "Craft narratives, design advice, and weaver spotlights."
    });
    setJournalArticles([
      {
        id: "weavers-hand",
        category: "HERITAGE",
        title: "The Weaver's Hand: A Silent Dialogue with Time",
        snippet: "How generations of Persian artisans preserve the secrets of natural vegetable dyes and traditional loom techniques in a modern world.",
        image: "https://cdn-ilbbojh.nitrocdn.com/yyvsDFGeZElKShyJaLTBDMgRfhpOcrwy/assets/images/optimized/rev-55778e1/oxbridgegcsetutor.com/wp-content/uploads/2026/05/carpet-weavers-morocco-gcse-workshop-loom.png",
        date: "July 12, 2026",
        readTime: "5 min read"
      },
      {
        id: "anchoring-room",
        category: "DESIGN TIPS",
        title: "Anchoring the Room: Scaling Your Area Rug",
        snippet: "A comprehensive guide to choosing the perfect dimensions for living, dining, and bedroom spaces to create visual balance and define zones.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzyHmyaIFKWyNn-hlTlPwjTCMEC2Kzn9kfOcSeuzFg8w&s=10",
        date: "June 28, 2026",
        readTime: "4 min read"
      },
      {
        id: "beyond-loom",
        category: "SUSTAINABILITY",
        title: "Beyond the Loom: Ethical Sourcing & Sustainability",
        snippet: "Our commitment to 100% natural, biodegradable fibers and supporting fair-wage artisan cooperatives across historical weaving hubs.",
        image: "https://ajaypeecarpets.com/images/artisan-workshop.png",
        date: "May 15, 2026",
        readTime: "6 min read"
      }
    ]);
  };

  const parsePageSections = (page) => {
    setPageTitle(page.title || "Homepage Configuration");

    const colSec = page.sections.find(s => s.sectionKey === "explore-collections");
    if (colSec) {
      setCollectionsHeader({ title: colSec.title || "", subtitle: colSec.content || "" });
      setCollections(colSec.data?.collections || []);
    }

    const highSec = page.sections.find(s => s.sectionKey === "curated-highlights");
    if (highSec) {
      setHighlightsHeader({ title: highSec.title || "", subtitle: highSec.content || "" });
    }

    const jSec = page.sections.find(s => s.sectionKey === "journal");
    if (jSec) {
      setJournalHeader({ title: jSec.title || "", subtitle: jSec.content || "" });
      setJournalArticles(jSec.data?.articles || []);
    }
  };

  const handleSaveCms = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      title: pageTitle,
      isActive: true,
      sections: [
        {
          sectionKey: "explore-collections",
          title: collectionsHeader.title,
          content: collectionsHeader.subtitle,
          data: { collections }
        },
        {
          sectionKey: "curated-highlights",
          title: highlightsHeader.title,
          content: highlightsHeader.subtitle,
          data: { enabled: true }
        },
        {
          sectionKey: "journal",
          title: journalHeader.title,
          content: journalHeader.subtitle,
          data: { articles: journalArticles }
        }
      ]
    };

    try {
      const data = await apiRequest.put("/cms/homepage", payload);
      if (data.success) {
        setSuccess("Homepage CMS saved successfully!");
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save CMS changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCollectionChange = (index, field, value) => {
    const updated = [...collections];
    updated[index][field] = value;
    setCollections(updated);
  };

  const handleAddCollection = () => {
    const newId = `col-${Date.now()}`;
    setCollections([
      ...collections,
      {
        id: newId,
        name: "New Collection",
        description: "Collection description...",
        count: "0 Products",
        image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80",
        link: "#"
      }
    ]);
  };

  const handleRemoveCollection = (index) => {
    if (!window.confirm("Are you sure you want to remove this collection?")) return;
    setCollections(collections.filter((_, idx) => idx !== index));
  };

  const handleArticleChange = (index, field, value) => {
    const updated = [...journalArticles];
    updated[index][field] = value;
    setJournalArticles(updated);
  };

  const handleAddArticle = () => {
    const newId = `art-${Date.now()}`;
    setJournalArticles([
      ...journalArticles,
      {
        id: newId,
        category: "EDITORIAL",
        title: "New Journal Article Title",
        snippet: "Short summary snippet of the article...",
        image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&q=80",
        date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        readTime: "4 min read"
      }
    ]);
  };

  const handleRemoveArticle = (index) => {
    if (!window.confirm("Are you sure you want to remove this article?")) return;
    setJournalArticles(journalArticles.filter((_, idx) => idx !== index));
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Homepage CMS Editor</h2>
          <p style={styles.subtitle}>Customize collections, curated highlights, and journal articles</p>
        </div>
        <button
          onClick={handleSaveCms}
          className="btn btn-primary"
          style={styles.saveBtn}
          disabled={saving || loading}
        >
          <Save size={15} />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {success && (
        <div className="badge badge-success fade-in" style={styles.alertBox}>
          {success}
        </div>
      )}

      {error && (
        <div className="badge badge-danger fade-in" style={styles.alertBox}>
          {error}
        </div>
      )}

      {/* Editor Layout split */}
      <div style={styles.layoutSplit}>
        {/* Left Side: Tabs Selector */}
        <div style={styles.tabsCol} className="glass">
          <h3 style={styles.tabsHeader}>Landing Sections</h3>
          
          <button
            onClick={() => setActiveTab("collections")}
            style={{ ...styles.tabBtn, ...(activeTab === "collections" ? styles.tabBtnActive : {}) }}
          >
            <Grid size={17} />
            <span>Explore Collections</span>
          </button>

          <button
            onClick={() => setActiveTab("highlights")}
            style={{ ...styles.tabBtn, ...(activeTab === "highlights" ? styles.tabBtnActive : {}) }}
          >
            <Star size={17} />
            <span>Curated Highlights</span>
          </button>

          <button
            onClick={() => setActiveTab("journal")}
            style={{ ...styles.tabBtn, ...(activeTab === "journal" ? styles.tabBtnActive : {}) }}
          >
            <BookOpen size={17} />
            <span>From Our Journal</span>
          </button>

          <div style={styles.lockedDivider}>
            <span>Protected Sections</span>
          </div>

          <button
            onClick={() => setActiveTab("locked-hero")}
            style={{ ...styles.tabBtn, ...(activeTab === "locked-hero" ? styles.tabBtnActive : {}), opacity: 0.7 }}
          >
            <Lock size={16} />
            <span>Hero Showcase</span>
          </button>

          <button
            onClick={() => setActiveTab("locked-news")}
            style={{ ...styles.tabBtn, ...(activeTab === "locked-news" ? styles.tabBtnActive : {}), opacity: 0.7 }}
          >
            <Lock size={16} />
            <span>Newsletter Row</span>
          </button>
        </div>

        {/* Right Side: Tab editor workspace */}
        <div style={styles.workspaceCol}>
          {loading ? (
            <div style={styles.loadingWS}>
              <RefreshCw className="animate-spin" size={26} style={{ color: "var(--primary-brand)" }} />
              <span>Loading CMS configuration...</span>
            </div>
          ) : (
            <div className="fade-in">
              {/* Tab 1: Circular Collections */}
              {activeTab === "collections" && (
                <div style={styles.wsPanel} className="glass">
                  <div style={styles.wsPanelHeader}>
                    <div>
                      <h3 style={styles.panelTitle}>Explore Collections Section</h3>
                      <p style={styles.panelDesc}>Update collection grid headers and items displayed on the homepage</p>
                    </div>
                    <button onClick={handleAddCollection} className="btn btn-secondary" style={styles.addBtn}>
                      <Plus size={14} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Headers inputs */}
                  <div style={styles.inputRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="colHeaderTitle">Section Title</label>
                      <input
                        id="colHeaderTitle"
                        type="text"
                        value={collectionsHeader.title}
                        onChange={(e) => setCollectionsHeader({ ...collectionsHeader, title: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label className="form-label" htmlFor="colHeaderSub">Subtitle</label>
                      <input
                        id="colHeaderSub"
                        type="text"
                        value={collectionsHeader.subtitle}
                        onChange={(e) => setCollectionsHeader({ ...collectionsHeader, subtitle: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Collections list */}
                  <div style={styles.rowCardsContainer}>
                    {collections.map((col, index) => (
                      <div key={col.id || index} style={styles.cmsRowCard}>
                        <div style={styles.cardIndexHeader}>
                          <span style={styles.cardIndexNumber}>Collection #{index + 1}</span>
                          <button onClick={() => handleRemoveCollection(index)} style={styles.trashBtn}>
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div style={styles.cardInputsGrid}>
                          <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                              type="text"
                              value={col.name || ""}
                              onChange={(e) => handleCollectionChange(index, "name", e.target.value)}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Product Count Tag</label>
                            <input
                              type="text"
                              value={col.count || ""}
                              onChange={(e) => handleCollectionChange(index, "count", e.target.value)}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group" style={{ gridColumn: "span 2" }}>
                            <label className="form-label">Image URL</label>
                            <input
                              type="text"
                              value={col.image || ""}
                              onChange={(e) => handleCollectionChange(index, "image", e.target.value)}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Link</label>
                            <input
                              type="text"
                              value={col.link || ""}
                              onChange={(e) => handleCollectionChange(index, "link", e.target.value)}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group" style={{ gridColumn: "span 3" }}>
                            <label className="form-label">Description</label>
                            <input
                              type="text"
                              value={col.description || ""}
                              onChange={(e) => handleCollectionChange(index, "description", e.target.value)}
                              className="form-input"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Curated Highlights */}
              {activeTab === "highlights" && (
                <div style={styles.wsPanel} className="glass">
                  <div style={styles.wsPanelHeader}>
                    <div>
                      <h3 style={styles.panelTitle}>Curated Highlights Section</h3>
                      <p style={styles.panelDesc}>Update title and subtitle for the homepage featured showcase</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="highTitle">Section Title</label>
                    <input
                      id="highTitle"
                      type="text"
                      value={highlightsHeader.title}
                      onChange={(e) => setHighlightsHeader({ ...highlightsHeader, title: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="highSub">Subtitle</label>
                    <input
                      id="highSub"
                      type="text"
                      value={highlightsHeader.subtitle}
                      onChange={(e) => setHighlightsHeader({ ...highlightsHeader, subtitle: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={styles.infoInfoBox}>
                    <Star size={17} style={{ color: "var(--color-info)" }} />
                    <span>Curated Highlights automatically feature products from your active inventory.</span>
                  </div>
                </div>
              )}

              {/* Tab 3: Journal Row */}
              {activeTab === "journal" && (
                <div style={styles.wsPanel} className="glass">
                  <div style={styles.wsPanelHeader}>
                    <div>
                      <h3 style={styles.panelTitle}>From Our Journal Section</h3>
                      <p style={styles.panelDesc}>Manage articles shown in the journal section</p>
                    </div>
                    <button onClick={handleAddArticle} className="btn btn-secondary" style={styles.addBtn}>
                      <Plus size={14} />
                      <span>Add Article</span>
                    </button>
                  </div>

                  {/* Headers inputs */}
                  <div style={styles.inputRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" htmlFor="jTitle">Section Title</label>
                      <input
                        id="jTitle"
                        type="text"
                        value={journalHeader.title}
                        onChange={(e) => setJournalHeader({ ...journalHeader, title: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label className="form-label" htmlFor="jSub">Subtitle</label>
                      <input
                        id="jSub"
                        type="text"
                        value={journalHeader.subtitle}
                        onChange={(e) => setJournalHeader({ ...journalHeader, subtitle: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Journal list */}
                  <div style={styles.rowCardsContainer}>
                    {journalArticles.map((art, index) => (
                      <div key={art.id || index} style={styles.cmsRowCard}>
                        <div style={styles.cardIndexHeader}>
                          <span style={styles.cardIndexNumber}>Article #{index + 1}</span>
                          <button onClick={() => handleRemoveArticle(index)} style={styles.trashBtn}>
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div style={styles.cardInputsGrid}>
                          <div className="form-group">
                            <label className="form-label">Category / Tag</label>
                            <input
                              type="text"
                              value={art.category || ""}
                              onChange={(e) => handleArticleChange(index, "category", e.target.value)}
                              className="form-input"
                              placeholder="e.g. HERITAGE"
                            />
                          </div>

                          <div className="form-group" style={{ gridColumn: "span 2" }}>
                            <label className="form-label">Title</label>
                            <input
                              type="text"
                              value={art.title || ""}
                              onChange={(e) => handleArticleChange(index, "title", e.target.value)}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group" style={{ gridColumn: "span 3" }}>
                            <label className="form-label">Cover Image URL</label>
                            <input
                              type="text"
                              value={art.image || ""}
                              onChange={(e) => handleArticleChange(index, "image", e.target.value)}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Read Time</label>
                            <input
                              type="text"
                              value={art.readTime || ""}
                              onChange={(e) => handleArticleChange(index, "readTime", e.target.value)}
                              className="form-input"
                              placeholder="e.g. 5 min read"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Date Display</label>
                            <input
                              type="text"
                              value={art.date || ""}
                              onChange={(e) => handleArticleChange(index, "date", e.target.value)}
                              className="form-input"
                            />
                          </div>

                          <div className="form-group" style={{ gridColumn: "span 3" }}>
                            <label className="form-label">Snippet</label>
                            <textarea
                              value={art.snippet || ""}
                              onChange={(e) => handleArticleChange(index, "snippet", e.target.value)}
                              className="form-input"
                              rows={2}
                              style={{ resize: "none" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Locked Hero Banner Section */}
              {activeTab === "locked-hero" && (
                <div style={styles.wsPanel} className="glass">
                  <div style={styles.lockedContainer}>
                    <Lock size={40} style={{ color: "var(--primary-brand)", marginBottom: "14px" }} />
                    <h3 style={styles.lockedTitle}>Hero Showcase is Locked</h3>
                    <p style={styles.lockedDesc}>
                      Hero Section and Newsletter images are locked and cannot be edited via the CMS as per design requirements.
                    </p>
                    <div style={styles.lockBadge}>
                      <span>CMS PROTECTION ACTIVE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Locked Newsletter Section */}
              {activeTab === "locked-news" && (
                <div style={styles.wsPanel} className="glass">
                  <div style={styles.lockedContainer}>
                    <Lock size={40} style={{ color: "var(--primary-brand)", marginBottom: "14px" }} />
                    <h3 style={styles.lockedTitle}>Newsletter Row is Locked</h3>
                    <p style={styles.lockedDesc}>
                      Hero Section and Newsletter images are locked and cannot be edited via the CMS as per design requirements.
                    </p>
                    <div style={styles.lockBadge}>
                      <span>CMS PROTECTION ACTIVE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    marginTop: "2px",
  },
  saveBtn: {
    padding: "11px 22px",
    fontSize: "14px",
  },
  alertBox: {
    padding: "12px 18px",
    fontSize: "14px",
    borderRadius: "var(--border-radius-sm)",
    marginBottom: "24px",
    width: "100%",
  },
  layoutSplit: {
    display: "flex",
    gap: "28px",
    alignItems: "flex-start",
  },
  tabsCol: {
    width: "260px",
    borderRadius: "var(--border-radius)",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flexShrink: 0,
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    boxShadow: "var(--shadow-xs)",
  },
  tabsHeader: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    paddingBottom: "10px",
    marginBottom: "6px",
    borderBottom: "1px solid var(--border-color)",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 14px",
    borderRadius: "var(--border-radius-sm)",
    color: "var(--text-secondary)",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    width: "100%",
    textAlign: "left",
    transition: "var(--transition-fast)",
  },
  tabBtnActive: {
    backgroundColor: "var(--primary-brand-light)",
    color: "var(--primary-brand)",
    fontWeight: "600",
  },
  lockedDivider: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: "16px",
    marginBottom: "6px",
    paddingLeft: "14px",
  },
  workspaceCol: {
    flex: 1,
  },
  loadingWS: {
    height: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "var(--text-secondary)",
  },
  wsPanel: {
    padding: "28px",
    borderRadius: "var(--border-radius)",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    boxShadow: "var(--shadow-sm)",
  },
  wsPanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "18px",
    marginBottom: "20px",
  },
  panelTitle: {
    fontSize: "19px",
    fontWeight: "600",
  },
  panelDesc: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  addBtn: {
    padding: "8px 14px",
    fontSize: "12px",
  },
  inputRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  rowCardsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cmsRowCard: {
    backgroundColor: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-sm)",
    padding: "20px",
  },
  cardIndexHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "10px",
    marginBottom: "16px",
  },
  cardIndexNumber: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--primary-brand)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  trashBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--color-danger)",
    cursor: "pointer",
    padding: "4px",
    transition: "var(--transition-fast)",
  },
  cardInputsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "14px 18px",
  },
  infoInfoBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "rgba(29, 78, 216, 0.06)",
    border: "1px solid rgba(29, 78, 216, 0.18)",
    borderRadius: "var(--border-radius-sm)",
    padding: "13px 16px",
    marginTop: "24px",
    fontSize: "13px",
    color: "var(--color-info)",
    lineHeight: "1.4",
  },
  lockedContainer: {
    padding: "48px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    maxWidth: "460px",
    margin: "0 auto",
  },
  lockedTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  lockedDesc: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  lockBadge: {
    padding: "5px 12px",
    backgroundColor: "var(--primary-brand-light)",
    border: "1px solid rgba(108, 29, 27, 0.2)",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--primary-brand)",
    letterSpacing: "0.05em",
  },
};
