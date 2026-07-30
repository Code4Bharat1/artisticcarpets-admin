"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { apiRequest } from "@/lib/api";
import {
  FileText, Grid, BookOpen, Star, Lock, Plus, Trash2,
  Save, RefreshCw, AlertTriangle, ExternalLink, Edit2, Link2
} from "lucide-react";

export default function CmsEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("collections");
  const [refreshKey, setRefreshKey] = useState(0);

  const [pageTitle, setPageTitle] = useState("Homepage Configuration");
  const [collections, setCollections] = useState([]);
  const [collectionsHeader, setCollectionsHeader] = useState({ title: "", subtitle: "" });
  const [journalArticles, setJournalArticles] = useState([]);
  const [journalHeader, setJournalHeader] = useState({ title: "", subtitle: "" });
  const [heroHeader, setHeroHeader] = useState({ title: "", subtitle: "", image: "", ctaText: "", ctaLink: "" });
  const [newsHeader, setNewsHeader] = useState({ title: "", subtitle: "", image: "" });
  const [footerLinks, setFooterLinks] = useState({ instagram: "", facebook: "", email: "" });
  const [highlightsHeader, setHighlightsHeader] = useState({ title: "", subtitle: "" });
  const [highlightsProducts, setHighlightsProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await apiRequest.get("/products?limit=100&status=active");
      if (res.success) {
        setAvailableProducts(res.data?.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch available products", err);
    }
  };

  const fetchCmsData = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const data = await apiRequest.get("/cms/homepage");
      if (data.success && data.page && data.page.sections && data.page.sections.length > 0) {
        parsePageSections(data.page);
      } else {
        loadStaticDefaults();
      }
    } catch (err) {
      setError("Failed to fetch CMS page. Operating in fallback mode.");
      loadStaticDefaults(); console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCmsData(); fetchProducts(); }, []);

  const loadStaticDefaults = () => {
    setCollectionsHeader({ title: "Explore Our Collections", subtitle: "Crafted for every space, inspired by centuries of artistry." });
    setCollections([
      { id: "persian-rugs", name: "Persian Rugs", description: "Hand-knotted masterpieces inspired by centuries of heritage.", count: "124 Products", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwkZ-8Xama4gfHG2H9s9vunhksD5kK_ukjgQDQSIsojw&s=10", link: "#" },
      { id: "modern-rugs", name: "Modern Rugs", description: "Contemporary designs crafted for elegant living spaces.", count: "86 Products", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjtJjEy9j8D1SEREGlqErs7sx2EzlWh15Pw3UU_P-nPw&s=10", link: "#" },
      { id: "vintage-rugs", name: "Vintage Rugs", description: "Beautifully aged pieces with timeless character.", count: "58 Products", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80", link: "#" },
      { id: "outdoor-rugs", name: "Outdoor Rugs", description: "Durable luxury rugs made for indoor and outdoor living.", count: "43 Products", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", link: "#" },
    ]);
    setHighlightsHeader({ title: "Curated Highlights", subtitle: "Hand-selected masterpieces from our latest arrivals." });
    setHighlightsProducts([
      { id: "h1", title: "Royal Persian Silk", price: 125000, discountPrice: 95000, image: "/Carpet1.png", hoverimage: "/background.png", badge: "Best Seller", rating: 5, stock: 10, slug: "royal-persian-silk" }
    ]);
    setJournalHeader({ title: "From Our Journal", subtitle: "Craft narratives, design advice, and weaver spotlights." });
    setJournalArticles([
      { id: "weavers-hand", category: "HERITAGE", title: "The Weaver's Hand: A Silent Dialogue with Time", snippet: "How generations of Persian artisans preserve the secrets of natural vegetable dyes...", image: "https://cdn-ilbbojh.nitrocdn.com/yyvsDFGeZElKShyJaLTBDMgRfhpOcrwy/assets/images/optimized/rev-55778e1/oxbridgegcsetutor.com/wp-content/uploads/2026/05/carpet-weavers-morocco-gcse-workshop-loom.png", date: "July 12, 2026", readTime: "5 min read" },
      { id: "anchoring-room", category: "DESIGN TIPS", title: "Anchoring the Room: Scaling Your Area Rug", snippet: "A comprehensive guide to choosing the perfect dimensions for living, dining, and bedroom spaces.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzyHmyaIFKWyNn-hlTlPwjTCMEC2Kzn9kfOcSeuzFg8w&s=10", date: "June 28, 2026", readTime: "4 min read" },
      { id: "beyond-loom", category: "SUSTAINABILITY", title: "Beyond the Loom: Ethical Sourcing & Sustainability", snippet: "Our commitment to 100% natural, biodegradable fibers and supporting fair-wage artisan cooperatives.", image: "https://ajaypeecarpets.com/images/artisan-workshop.png", date: "May 15, 2026", readTime: "6 min read" },
    ]);
    setHeroHeader({ title: "Artistic Carpets", subtitle: "Timeless luxury woven into every thread", image: "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=1920&q=80", ctaText: "Shop the Collection", ctaLink: "/shop" });
    setNewsHeader({ title: "Join Our Newsletter", subtitle: "Subscribe to receive updates, access to exclusive deals, and more.", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1920&q=80" });
  };

  const parsePageSections = (page) => {
    setPageTitle(page.title || "Homepage Configuration");
    const colSec = page.sections.find(s => s.sectionKey === "explore-collections");
    if (colSec) { setCollectionsHeader({ title: colSec.title || "", subtitle: colSec.content || "" }); setCollections(colSec.data?.collections || []); }
    const highSec = page.sections.find(s => s.sectionKey === "curated-highlights");
    if (highSec) { 
      setHighlightsHeader({ title: highSec.title || "", subtitle: highSec.content || "" }); 
      setHighlightsProducts(highSec.data?.products || []);
    }
    const jSec = page.sections.find(s => s.sectionKey === "journal");
    if (jSec) { setJournalHeader({ title: jSec.title || "", subtitle: jSec.content || "" }); setJournalArticles(jSec.data?.articles || []); }
    const heroSec = page.sections.find(s => s.sectionKey === "locked-hero");
    if (heroSec) setHeroHeader({ title: heroSec.title || "", subtitle: heroSec.content || "", ...heroSec.data });
    const newsSec = page.sections.find(s => s.sectionKey === "locked-news");
    if (newsSec) setNewsHeader({ title: newsSec.title || "", subtitle: newsSec.content || "", ...newsSec.data });
    const footSec = page.sections.find(s => s.sectionKey === "footer");
    if (footSec) setFooterLinks(footSec.data || { instagram: "", facebook: "", email: "" });
  };

  const handleSaveCms = async () => {
    setSaving(true); setError(""); setSuccess("");
    const payload = {
      title: pageTitle, isActive: true,
      sections: [
        { sectionKey: "explore-collections", title: collectionsHeader.title, content: collectionsHeader.subtitle, data: { collections } },
        { sectionKey: "curated-highlights", title: highlightsHeader.title, content: highlightsHeader.subtitle, data: { products: highlightsProducts } },
        { sectionKey: "journal", title: journalHeader.title, content: journalHeader.subtitle, data: { articles: journalArticles } },
        { sectionKey: "footer", title: "Footer", content: "", data: footerLinks },
      ]
    };
    try {
      const data = await apiRequest.put("/cms/homepage", payload);
      if (data.success) { setSuccess("Homepage CMS saved successfully!"); setTimeout(() => setSuccess(""), 4000); }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save CMS changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCollectionChange = (index, field, value) => { const u = [...collections]; u[index][field] = value; setCollections(u); };
  const handleAddCollection = () => setCollections([...collections, { id: `col-${Date.now()}`, name: "New Collection", description: "Collection description...", count: "0 Products", image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80", link: "#" }]);
  const handleRemoveCollection = (index) => { if (!window.confirm("Remove this collection?")) return; setCollections(collections.filter((_, i) => i !== index)); };

  const handleArticleChange = (index, field, value) => { const u = [...journalArticles]; u[index][field] = value; setJournalArticles(u); };
  const handleAddArticle = () => setJournalArticles([...journalArticles, { id: `art-${Date.now()}`, category: "EDITORIAL", title: "New Journal Article Title", snippet: "Short summary snippet...", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&q=80", date: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }), readTime: "4 min read" }]);
  const handleRemoveArticle = (index) => { if (!window.confirm("Remove this article?")) return; setJournalArticles(journalArticles.filter((_, i) => i !== index)); };

  const handleProductToggle = (productId) => {
    if (highlightsProducts.includes(productId)) {
      setHighlightsProducts(highlightsProducts.filter(id => id !== productId));
    } else {
      if (highlightsProducts.length >= 6) {
        alert("You can only select up to 6 products for Curated Highlights.");
        return;
      }
      setHighlightsProducts([...highlightsProducts, productId]);
    }
  };

  const handleToggleBestSeller = async (productId, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append("isBestSeller", !currentStatus);
      const data = await apiRequest.put(`/products/${productId}`, formData);
      if (data.success) {
        setAvailableProducts(availableProducts.map(p => 
          p._id === productId ? { ...p, isBestSeller: !currentStatus } : p
        ));
        setSuccess(`Product best seller status updated.`);
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update best seller status.");
      setTimeout(() => setError(""), 4000);
    }
  };

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Homepage CMS Editor</h2>
            <p style={styles.subtitle}>Customize collections, curated highlights, and journal articles</p>
          </div>
          <button onClick={handleSaveCms} className="btn btn-primary" style={styles.saveBtn} disabled={saving || loading}>
            <Save size={15} /><span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

        {success && <div className="badge badge-success fade-in" style={styles.alertBox}>{success}</div>}
        {error && <div className="badge badge-danger fade-in" style={styles.alertBox}>{error}</div>}

        {/* Editor Layout */}
        <div style={styles.layoutSplit}>
          {/* Top: Horizontal Tabs */}
          <div style={styles.tabsRow} className="glass">
            {[
              { id: "collections", label: "Explore Collections", icon: Grid },
              { id: "highlights", label: "Curated Highlights", icon: Star },
              { id: "journal", label: "Journal Articles", icon: BookOpen },
              { id: "footer", label: "Footer Links", icon: Link2 },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ ...styles.tabBtn, ...(activeTab === id ? styles.tabBtnActive : {}) }}>
                <Icon size={16} /><span>{label}</span>
              </button>
            ))}
          </div>

          {/* Bottom: Split Workspace and Preview */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "stretch", minHeight: "800px" }}>
            {/* Left: Workspace Forms */}
            <div style={styles.workspaceCol}>
              {loading ? (
                <div style={styles.loadingWS}>
                  <RefreshCw className="animate-spin" size={26} style={{ color: "var(--primary-brand)" }} />
                  <span>Loading CMS configuration...</span>
                </div>
              ) : (
                <div className="fade-in">
                {activeTab === "collections" && (
                  <div style={styles.wsPanel} className="glass">
                    <div style={styles.wsPanelHeader}>
                      <div><h3 style={styles.panelTitle}>Explore Collections Section</h3><p style={styles.panelDesc}>Update collection grid headers and items displayed on the homepage</p></div>
                      <button onClick={handleAddCollection} className="btn btn-secondary" style={styles.addBtn}><Plus size={14} /><span>Add Item</span></button>
                    </div>
                    <div style={styles.inputRow}>
                      <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="colHeaderTitle">Section Title</label><input id="colHeaderTitle" type="text" value={collectionsHeader.title} onChange={(e) => setCollectionsHeader({ ...collectionsHeader, title: e.target.value })} className="form-input" /></div>
                      <div className="form-group" style={{ flex: 2 }}><label className="form-label" htmlFor="colHeaderSub">Subtitle</label><input id="colHeaderSub" type="text" value={collectionsHeader.subtitle} onChange={(e) => setCollectionsHeader({ ...collectionsHeader, subtitle: e.target.value })} className="form-input" /></div>
                    </div>
                    <div style={styles.rowCardsContainer}>
                      {collections.map((col, index) => (
                        <div key={col.id || index} style={styles.cmsRowCard}>
                          <div style={styles.cardIndexHeader}><span style={styles.cardIndexNumber}>Collection #{index + 1}</span><button onClick={() => handleRemoveCollection(index)} style={styles.trashBtn}><Trash2 size={15} /></button></div>
                          <div style={styles.cardInputsGrid}>
                            <div className="form-group"><label className="form-label">Name</label><input type="text" value={col.name || ""} onChange={(e) => handleCollectionChange(index, "name", e.target.value)} className="form-input" /></div>
                            <div className="form-group"><label className="form-label">Product Count Tag</label><input type="text" value={col.count || ""} onChange={(e) => handleCollectionChange(index, "count", e.target.value)} className="form-input" /></div>
                            <div className="form-group" style={{ gridColumn: "span 2" }}><label className="form-label">Image URL</label><input type="text" value={col.image || ""} onChange={(e) => handleCollectionChange(index, "image", e.target.value)} className="form-input" /></div>
                            <div className="form-group"><label className="form-label">Link</label><input type="text" value={col.link || ""} onChange={(e) => handleCollectionChange(index, "link", e.target.value)} className="form-input" /></div>
                            <div className="form-group" style={{ gridColumn: "span 3" }}><label className="form-label">Description</label><input type="text" value={col.description || ""} onChange={(e) => handleCollectionChange(index, "description", e.target.value)} className="form-input" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "highlights" && (
                  <div style={styles.wsPanel} className="glass">
                    <div style={styles.wsPanelHeader}>
                      <div><h3 style={styles.panelTitle}>Curated Highlights Section</h3><p style={styles.panelDesc}>Update the title and subtitle for the Curated Highlights section</p></div>
                    </div>
                    <div style={styles.inputRow}>
                      <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="hlTitle">Section Title</label><input id="hlTitle" type="text" value={highlightsHeader.title} onChange={(e) => setHighlightsHeader({ ...highlightsHeader, title: e.target.value })} className="form-input" /></div>
                      <div className="form-group" style={{ flex: 2 }}><label className="form-label" htmlFor="hlSub">Subtitle</label><input id="hlSub" type="text" value={highlightsHeader.subtitle} onChange={(e) => setHighlightsHeader({ ...highlightsHeader, subtitle: e.target.value })} className="form-input" /></div>
                    </div>
                    
                    <div style={{ marginTop: "24px" }}>
                      <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>
                        Select Products ({highlightsProducts.length}/6)
                      </label>
                      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "12px", display: "grid", gap: "10px", backgroundColor: "var(--bg-tertiary)" }}>
                        {availableProducts.length > 0 ? (
                          availableProducts.map(product => (
                            <div key={product._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", backgroundColor: "var(--bg-primary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                              <input 
                                type="checkbox" 
                                id={`prod-${product._id}`}
                                checked={highlightsProducts.includes(product._id)}
                                onChange={() => handleProductToggle(product._id)}
                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                              />
                              {product.thumbnail && product.thumbnail.url && (
                                <img src={product.thumbnail.url} alt={product.title} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                              )}
                              <div style={{ flex: 1 }}>
                                <label htmlFor={`prod-${product._id}`} style={{ cursor: "pointer", fontWeight: 500, fontSize: "14px", color: "var(--text-primary)" }}>{product.title}</label>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>SKU: {product.sku}</p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); handleToggleBestSeller(product._id, product.isBestSeller); }}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  color: product.isBestSeller ? "#eab308" : "var(--text-muted)",
                                  display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600",
                                  padding: "4px 8px", borderRadius: "4px", backgroundColor: product.isBestSeller ? "rgba(234, 179, 8, 0.1)" : "transparent"
                                }}
                                title={product.isBestSeller ? "Remove from Best Sellers" : "Mark as Best Seller"}
                              >
                                <Star fill={product.isBestSeller ? "#eab308" : "none"} size={16} />
                                <span className="hidden sm:inline" style={{ marginLeft: "4px" }}>
                                  {product.isBestSeller ? "Best Seller" : "Set Best Seller"}
                                </span>
                              </button>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No active products available.</p>
                        )}
                      </div>
                      <p style={styles.infoInfoBox}>Selected products will be displayed on the homepage. If no products are selected, the 6 best selling products will be shown automatically.</p>
                    </div>
                  </div>
                )}

                {activeTab === "journal" && (
                  <div style={styles.wsPanel} className="glass">
                    <div style={styles.wsPanelHeader}>
                      <div><h3 style={styles.panelTitle}>From Our Journal Section</h3><p style={styles.panelDesc}>Manage articles shown in the journal section</p></div>
                      <button onClick={handleAddArticle} className="btn btn-secondary" style={styles.addBtn}><Plus size={14} /><span>Add Article</span></button>
                    </div>
                    <div style={styles.inputRow}>
                      <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="jTitle">Section Title</label><input id="jTitle" type="text" value={journalHeader.title} onChange={(e) => setJournalHeader({ ...journalHeader, title: e.target.value })} className="form-input" /></div>
                      <div className="form-group" style={{ flex: 2 }}><label className="form-label" htmlFor="jSub">Subtitle</label><input id="jSub" type="text" value={journalHeader.subtitle} onChange={(e) => setJournalHeader({ ...journalHeader, subtitle: e.target.value })} className="form-input" /></div>
                    </div>
                    <div style={styles.rowCardsContainer}>
                      {journalArticles.map((art, index) => (
                        <div key={art.id || index} style={styles.cmsRowCard}>
                          <div style={styles.cardIndexHeader}><span style={styles.cardIndexNumber}>Article #{index + 1}</span><button onClick={() => handleRemoveArticle(index)} style={styles.trashBtn}><Trash2 size={15} /></button></div>
                          <div style={styles.cardInputsGrid}>
                            <div className="form-group"><label className="form-label">Category / Tag</label><input type="text" value={art.category || ""} onChange={(e) => handleArticleChange(index, "category", e.target.value)} className="form-input" placeholder="e.g. HERITAGE" /></div>
                            <div className="form-group" style={{ gridColumn: "span 2" }}><label className="form-label">Title</label><input type="text" value={art.title || ""} onChange={(e) => handleArticleChange(index, "title", e.target.value)} className="form-input" /></div>
                            <div className="form-group" style={{ gridColumn: "span 3" }}><label className="form-label">Cover Image URL</label><input type="text" value={art.image || ""} onChange={(e) => handleArticleChange(index, "image", e.target.value)} className="form-input" /></div>
                            <div className="form-group"><label className="form-label">Read Time</label><input type="text" value={art.readTime || ""} onChange={(e) => handleArticleChange(index, "readTime", e.target.value)} className="form-input" placeholder="e.g. 5 min read" /></div>
                            <div className="form-group"><label className="form-label">Date Display</label><input type="text" value={art.date || ""} onChange={(e) => handleArticleChange(index, "date", e.target.value)} className="form-input" /></div>
                            <div className="form-group" style={{ gridColumn: "span 3" }}><label className="form-label">Snippet</label><textarea value={art.snippet || ""} onChange={(e) => handleArticleChange(index, "snippet", e.target.value)} className="form-input" rows={2} style={{ resize: "none" }} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "footer" && (
                  <div style={styles.wsPanel} className="glass">
                    <div style={styles.wsPanelHeader}>
                      <div><h3 style={styles.panelTitle}>Footer Social Links</h3><p style={styles.panelDesc}>Update the links for Instagram, Facebook, and Email in the website footer</p></div>
                    </div>
                    <div style={styles.inputRow}>
                      <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="instaLink">Instagram URL</label><input id="instaLink" type="text" value={footerLinks.instagram} onChange={(e) => setFooterLinks({ ...footerLinks, instagram: e.target.value })} className="form-input" placeholder="https://instagram.com/..." /></div>
                      <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="fbLink">Facebook / Pinterest URL</label><input id="fbLink" type="text" value={footerLinks.facebook} onChange={(e) => setFooterLinks({ ...footerLinks, facebook: e.target.value })} className="form-input" placeholder="https://facebook.com/..." /></div>
                      <div className="form-group" style={{ flex: 1 }}><label className="form-label" htmlFor="emailLink">Email Address</label><input id="emailLink" type="text" value={footerLinks.email} onChange={(e) => setFooterLinks({ ...footerLinks, email: e.target.value })} className="form-input" placeholder="contact@example.com" /></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Right: Live Preview */}
            <div style={styles.previewCol}>
              <div style={styles.previewHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#666", marginLeft: "8px" }}>Website Preview</span>
                </div>
                <button 
                  onClick={() => setRefreshKey(prev => prev + 1)} 
                  style={styles.refreshBtn}
                  title="Reload Preview"
                >
                  <RefreshCw size={14} /><span>Refresh</span>
                </button>
              </div>
              <iframe 
                key={refreshKey}
                id="previewIframe"
                src={`${process.env.NEXT_PUBLIC_FRONTEND_URL || "https://artisticcarpets.nexcorealliance.com"}#${activeTab}`} 
                style={styles.iframe} 
                title="Website Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "28px" },
  title: { fontSize: "28px", fontWeight: "700" },
  subtitle: { fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" },
  saveBtn: { padding: "11px 22px", fontSize: "14px" },
  alertBox: { padding: "12px 18px", fontSize: "14px", borderRadius: "var(--border-radius-sm)", marginBottom: "24px", width: "100%" },
  layoutSplit: { display: "flex", flexDirection: "column", gap: "24px", alignItems: "stretch" },
  tabsRow: { display: "flex", flexDirection: "row", gap: "10px", padding: "12px 16px", borderRadius: "var(--border-radius)", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xs)", overflowX: "auto", alignItems: "center" },
  tabBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "var(--border-radius-sm)", color: "var(--text-secondary)", backgroundColor: "transparent", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "500", transition: "var(--transition-fast)", whiteSpace: "nowrap" },
  tabBtnActive: { backgroundColor: "var(--primary-brand-light)", color: "var(--primary-brand)", fontWeight: "600" },
  workspaceCol: { flex: "1 1 400px", minWidth: "300px" },
  loadingWS: { height: "280px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "var(--text-secondary)" },
  wsPanel: { padding: "28px", borderRadius: "var(--border-radius)", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" },
  wsPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "18px", marginBottom: "20px" },
  panelTitle: { fontSize: "19px", fontWeight: "600" },
  panelDesc: { fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" },
  addBtn: { padding: "8px 14px", fontSize: "12px" },
  inputRow: { display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" },
  rowCardsContainer: { display: "flex", flexDirection: "column", gap: "20px" },
  cmsRowCard: { backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--border-radius-sm)", padding: "20px" },
  cardIndexHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "16px" },
  cardIndexNumber: { fontSize: "12px", fontWeight: "700", color: "var(--primary-brand)", textTransform: "uppercase", letterSpacing: "0.04em" },
  trashBtn: { backgroundColor: "transparent", border: "none", color: "var(--color-danger)", cursor: "pointer", padding: "4px", transition: "var(--transition-fast)" },
  iconBtn: { backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "4px", cursor: "pointer", padding: "2px 8px", fontSize: "12px", color: "var(--text-secondary)", transition: "var(--transition-fast)" },
  cardInputsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px 18px" },
  infoInfoBox: { display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(29, 78, 216, 0.06)", border: "1px solid rgba(29, 78, 216, 0.18)", borderRadius: "var(--border-radius-sm)", padding: "13px 16px", marginTop: "24px", fontSize: "13px", color: "var(--color-info)", lineHeight: "1.4" },
  lockedContainer: { padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: "460px", margin: "0 auto" },
  lockedTitle: { fontSize: "20px", fontWeight: "600", marginBottom: "10px" },
  lockedDesc: { fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" },
  lockBadge: { padding: "5px 12px", backgroundColor: "var(--primary-brand-light)", border: "1px solid rgba(108, 29, 27, 0.2)", borderRadius: "4px", fontSize: "11px", fontWeight: "700", color: "var(--primary-brand)", letterSpacing: "0.05em" },
  previewCol: { flex: "1 1 350px", minWidth: "300px", borderRadius: "var(--border-radius)", border: "1px solid var(--border-color)", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-secondary)", boxShadow: "var(--shadow-sm)" },
  previewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" },
  refreshBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "var(--primary-brand)", fontSize: "12px", fontWeight: "600", transition: "var(--transition-fast)" },
  iframe: { flex: 1, width: "100%", border: "none", backgroundColor: "#fff" }
};
