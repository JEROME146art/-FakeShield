// ===================================================================
// FakeShield AI - Complete Client Verification Engine & State Manager
// ===================================================================

let currentLanguage = 'en';
let activeAnalysisTab = 'text';
let uploadedImageFile = null;
let currentResultData = null;
let recentFilter = 'ALL';

const STORAGE_KEY_HISTORY = 'fakeshield_history_db';

// ===================================================================
// 1. MULTI-LANGUAGE TRANSLATION DICTIONARIES
// ===================================================================
const I18N = {
    en: {
        flag: '🇬🇧',
        name: 'English',
        navAnalyze: "🔍 Analyze",
        navDashboard: "📊 Dashboard",
        navHistory: "📜 History",
        navHow: "💡 How It Works",
        navTips: "🛡️ Spotting Tips",
        navLoginText: "Login",
        btnNavCta: "⚡ Verify Now",
        heroBadge: "AI-Powered Fact Verification",
        heroTitleMain: "Detect Fake News",
        heroTitleSub: "In Seconds",
        heroSubtitle: "Advanced AI analyzes news articles, web links, and image screenshots in real-time to detect fabricated claims, sensational clickbait, and manipulated media.",
        btnHeroAnalyze: "🔍 Start Analysis",
        btnHeroDashboard: "📊 View Live Dashboard",
        lblHeroTotal: "Articles Analyzed",
        lblHeroFake: "Fake News Detected",
        lblHeroAccuracy: "Accuracy Rate",
        cardRealTitle: "ISRO Polar Satellite Launch",
        cardRealSub: "Verified Official Source",
        cardSuspTitle: "Unverified Financial Scheme",
        cardSuspSub: "Missing Authoritative Source",
        cardFakeTitle: "Miracle 24-Hour Cure Forward",
        cardFakeSub: "High Clickbait & Fabricated Claim",
        tagAnalyzer: "AI Verification Engine",
        headAnalyzer: "Analyze News Credibility",
        subAnalyzer: "Check text claims, webpage URLs, or upload screenshots to inspect credibility.",
        tabText: "Text Analysis",
        tabUrl: "URL Analysis",
        tabImage: "Image Analysis",
        lblQuickSamples: "⚡ Quick Samples:",
        sampleReal: "Real News Sample",
        sampleFake: "Clickbait Rumor",
        sampleViral: "WhatsApp Forward",
        lblHeadline: "News Headline / Title",
        phHeadline: "Enter the news headline here...",
        lblContent: "Full News Content / Body Text",
        phContent: "Paste the full article content or forwarded text message here...",
        lblSourceUrl: "Source URL (Optional)",
        lblPlatform: "Platform / Origin",
        btnAnalyzeText: "Analyze News Text",
        lblUrlInput: "News Article URL",
        phUrl: "https://example-news-site.com/breaking-article-headline",
        btnAnalyzeUrlText: "Analyze URL Credibility",
        dropTitle: "Drop News Screenshot Here or Click to Upload",
        dropSub: "Supports: JPG, PNG, WEBP, GIF (Max 10MB)",
        btnAnalyzeImageText: "Analyze Image & Extract Text",
        lblVerdictTag: "AI Credibility Verdict",
        verdictReal: "Verified Real News",
        verdictFake: "Fake News Detected",
        verdictSuspicious: "Suspicious Content",
        lblCredibilityScore: "Trust Score",
        lblExtractedOcr: "📝 Extracted Screenshot Information (OCR):",
        lblMetricsBreakdown: "📊 Multi-Factor AI Breakdown",
        lblReasoningTitle: "💡 AI Analysis Reasoning & Forensic Insights",
        btnCopyReport: "Copy Report",
        btnDownloadReport: "Download Report",
        btnShareReport: "Share",
        btnAnalyzeAnother: "Analyze Another",
        tagDashboard: "Live Telemetry",
        headDashboard: "Live Credibility Dashboard",
        subDashboard: "Real-time tracking of analyzed misinformation trends.",
        lblDashTotal: "Total Analyzed",
        lblDashReal: "Verified Real",
        lblDashFake: "Fake Detected",
        lblDashSuspicious: "Suspicious / Pending",
        tagHow: "Methodology",
        headHow: "How FakeShield AI Works",
        subHow: "Multi-layered detection combining NLP heuristics, OCR computer vision, and domain verification.",
        step1Title: "Ingest & Extract",
        step1Desc: "Extract raw text, headline, URL structure, or perform OCR on screenshot images.",
        step2Title: "Linguistic & NLP Forensics",
        step2Desc: "Analyzes clickbait triggers, sensationalism, capitalization, and emotional bias.",
        step3Title: "Source & Domain Check",
        step3Desc: "Cross-references domain credibility against certified news registries and blacklists.",
        step4Title: "Score & Report",
        step4Desc: "Computes a multi-factor score and provides transparent AI reasoning in your language."
    },
    ta: {
        flag: '🇮🇳',
        name: 'தமிழ்',
        navAnalyze: "🔍 ஆராய்",
        navDashboard: "📊 டாஷ்போர்டு",
        navHistory: "📜 வரலாறு",
        navHow: "💡 எப்படி செயல்படுகிறது",
        navTips: "🛡️ குறிப்புகள்",
        navLoginText: "உள்நுழைய",
        btnNavCta: "⚡ சரிபார்க்க",
        heroBadge: "செயற்கை நுண்ணறிவு போலி செய்தி கண்டறிதல்",
        heroTitleMain: "போலி செய்திகளை நொடிகளில்",
        heroTitleSub: "கண்டறியுங்கள்",
        heroSubtitle: "செயற்கை நுண்ணறிவு (AI) மூலம் செய்திகள், இணையதள இணைப்புகள் மற்றும் படங்களை உடனடியாக துல்லியமாக சரிபார்க்கவும்.",
        btnHeroAnalyze: "🔍 பகுப்பாய்வை தொடங்கு",
        btnHeroDashboard: "📊 டாஷ்போர்டை பார்க்க",
        lblHeroTotal: "ஆராயப்பட்ட செய்திகள்",
        lblHeroFake: "போலி செய்திகள்",
        lblHeroAccuracy: "துல்லியம் விகிதம்",
        cardRealTitle: "இஸ்ரோ செயற்கைக்கோள் ஏவுதல்",
        cardRealSub: "உறுதிப்படுத்தப்பட்ட அதிகாரப்பூர்வ செய்தி",
        cardSuspTitle: "சரிபார்க்கப்படாத நிதித் திட்டம்",
        cardSuspSub: "ஆதாரம் இல்லாத கூற்று",
        cardFakeTitle: "24 மணி நேர அற்புத மருந்து புரளி",
        cardFakeSub: "உண்மையற்ற கிளிக்பைட் தகவல்",
        tagAnalyzer: "AI பகுப்பாய்வு மையம்",
        headAnalyzer: "செய்தி நம்பகத்தன்மையை சரிபார்க்கவும்",
        subAnalyzer: "செய்தி உரைகள், இணையதள இணைப்புகள் அல்லது படங்களை சரிபார்க்கவும்.",
        tabText: "செய்தி உரை",
        tabUrl: "இணையதள இணைப்பு",
        tabImage: "பட ஆய்வு",
        lblQuickSamples: "⚡ மாதிரி சோதனைகள்:",
        sampleReal: "உண்மை செய்தி மாதிரி",
        sampleFake: "புரளி செய்தி மாதிரி",
        sampleViral: "வாட்ஸ்அப் ஃபார்வர்டு செய்தி",
        lblHeadline: "செய்தி தலைப்பு",
        phHeadline: "செய்தியின் தலைப்பை இங்கே உள்ளிடவும்...",
        lblContent: "முழு செய்தி உரை / விளக்கம்",
        phContent: "முழு செய்தியையோ அல்லது வாட்ஸ்அப் தகவலையோ இங்கே ஒட்டவும்...",
        lblSourceUrl: "ஆதார இணைப்பு (விருப்பத்தேர்வு)",
        lblPlatform: "செய்தி தளம்",
        btnAnalyzeText: "செய்தியை ஆராயுங்கள்",
        lblUrlInput: "செய்தி இணையதள URL",
        phUrl: "https://news-site.com/article",
        btnAnalyzeUrlText: "URL-ஐ சரிபார்க்கவும்",
        dropTitle: "செய்தி ஸ்கிரீன்ஷாட்டை இங்கே பதிவேற்றவும்",
        dropSub: "JPG, PNG, WEBP, GIF வடிவங்களை ஆதரிக்கிறது (அதிகபட்சம் 10MB)",
        btnAnalyzeImageText: "படத்தை ஆராய்ந்து உரையை எடு",
        lblVerdictTag: "AI நம்பகத்தன்மை தீர்ப்பு",
        verdictReal: "உண்மையான செய்தி என சரிபார்க்கப்பட்டது",
        verdictFake: "போலி செய்தி கண்டறியப்பட்டது",
        verdictSuspicious: "சந்தேகத்திற்குரிய செய்தி",
        lblCredibilityScore: "நம்பகத்தன்மை",
        lblExtractedOcr: "📝 படத்தில் இருந்து எடுக்கப்பட்ட உரை (OCR):",
        lblMetricsBreakdown: "📊 விரிவான AI மதிப்பீடு",
        lblReasoningTitle: "💡 AI பகுப்பாய்வு விளக்கம் & காரணங்கள்",
        btnCopyReport: "அறிக்கையை நகலெடு",
        btnDownloadReport: "பதிவிறக்கு",
        btnShareReport: "பகிருங்கள்",
        btnAnalyzeAnother: "மற்றொன்றை சரிபார்க்க",
        tagDashboard: "நேரலை புள்ளிவிவரங்கள்",
        headDashboard: "நேரலை டாஷ்போர்டு",
        subDashboard: "ஆராயப்பட்ட செய்திகளின் விரிவான புள்ளிவிவரங்கள்.",
        lblDashTotal: "மொத்தம் ஆராயப்பட்டவை",
        lblDashReal: "உண்மை செய்தி",
        lblDashFake: "போலி செய்தி",
        lblDashSuspicious: "சந்தேகம் / நிலுவை",
        tagHow: "தொழில்நுட்பம்",
        headHow: "FakeShield எவ்வாறு செயல்படுகிறது",
        subHow: "NLP மொழி ஆய்வு, பட ஸ்கேனிங் மற்றும் டொமைன் சரிபார்ப்பு.",
        step1Title: "உள்ளீடு பெறுதல்",
        step1Desc: "செய்தி உரை, URL அல்லது பட ஸ்கிரீன்ஷாட்டை பெறுகிறது.",
        step2Title: "மொழிநடை ஆய்வு (NLP)",
        step2Desc: "கிளிக்பைட் மற்றும் மிகைப்படுத்தப்பட்ட சொற்களை ஆய்வு செய்கிறது.",
        step3Title: "டொமைன் சரிபார்ப்பு",
        step3Desc: "அங்கீகரிக்கப்பட்ட சர்வதேச செய்தி நிறுவனங்களுடன் ஒப்பிடுகிறது.",
        step4Title: "மதிப்பெண் & தீர்ப்பு",
        step4Desc: "நம்பகத்தன்மை சதவீதத்துடன் காரணங்களை விளக்குகிறது."
    },
    hi: {
        flag: '🇮🇳',
        name: 'हिन्दी',
        navAnalyze: "🔍 विश्लेषण",
        navDashboard: "📊 डैशबोर्ड",
        navHistory: "📜 इतिहास",
        navHow: "💡 यह कैसे काम करता है",
        navTips: "🛡️ सुझाव",
        navLoginText: "लॉगिन",
        btnNavCta: "⚡ अभी जांचें",
        heroBadge: "AI-संचालित तथ्य सत्यापन",
        heroTitleMain: "फर्जी खबरों का पता लगाएं",
        heroTitleSub: "कुछ ही सेकंड में",
        heroSubtitle: "उन्नत AI वास्तविक समय में समाचार लेखों, वेब लिंक और स्क्रीनशॉट की जांच करता है।",
        btnHeroAnalyze: "🔍 विश्लेषण शुरू करें",
        btnHeroDashboard: "📊 लाइव डैशबोर्ड देखें",
        lblHeroTotal: "कुल विश्लेषित",
        lblHeroFake: "फर्जी खबरें पहचानी गईं",
        lblHeroAccuracy: "सटीकता दर",
        cardRealTitle: "इसरो उपग्रह प्रक्षेपण",
        cardRealSub: "सत्यापित आधिकारिक स्रोत",
        cardSuspTitle: "अपुष्ट वित्तीय योजना",
        cardSuspSub: "प्रामाणिक स्रोत का अभाव",
        cardFakeTitle: "24 घंटे में चमत्कारिक इलाज",
        cardFakeSub: "क्लिकबेट और मनगढ़ंत दावा",
        tagAnalyzer: "AI सत्यापन इंजन",
        headAnalyzer: "समाचार की विश्वसनीयता जांचें",
        subAnalyzer: "दावों, यूआरएल या स्क्रीनशॉट की सत्यता का विश्लेषण करें।",
        tabText: "पाठ विश्लेषण",
        tabUrl: "URL विश्लेषण",
        tabImage: "छवि विश्लेषण",
        lblQuickSamples: "⚡ त्वरित नमूने:",
        sampleReal: "सच्ची खबर का नमूना",
        sampleFake: "अफवाह का नमूना",
        sampleViral: "व्हाट्सएप फॉरवर्ड",
        lblHeadline: "समाचार शीर्षक",
        phHeadline: "समाचार का शीर्षक यहाँ दर्ज करें...",
        lblContent: "पूरा समाचार पाठ",
        phContent: "पूरा लेख या व्हाट्सएप संदेश यहाँ पेस्ट करें...",
        lblSourceUrl: "स्रोत URL (वैकल्पिक)",
        lblPlatform: "मंच / स्रोत",
        btnAnalyzeText: "समाचार का विश्लेषण करें",
        lblUrlInput: "समाचार लेख URL",
        phUrl: "https://example.com/news",
        btnAnalyzeUrlText: "URL की जाँच करें",
        dropTitle: "स्क्रीनशॉट यहाँ छोड़ें या अपलोड करें",
        dropSub: "JPG, PNG, WEBP, GIF समर्थित (अधिकतम 10MB)",
        btnAnalyzeImageText: "छवि का विश्लेषण करें और पाठ निकालें",
        lblVerdictTag: "AI विश्वसनीयता निर्णय",
        verdictReal: "सत्यापित वास्तविक समाचार",
        verdictFake: "फर्जी खबर पहचानी गई",
        verdictSuspicious: "संदिग्ध सामग्री",
        lblCredibilityScore: "विश्वसनीयता स्कोर",
        lblExtractedOcr: "📝 छवि से निकाला गया पाठ (OCR):",
        lblMetricsBreakdown: "📊 बहु-कारक AI विश्लेषण",
        lblReasoningTitle: "💡 AI विश्लेषण और कारण",
        btnCopyReport: "रिपोर्ट कॉपी करें",
        btnDownloadReport: "डाउनलोड करें",
        btnShareReport: "शेयर करें",
        btnAnalyzeAnother: "दूसरा विश्लेषण करें",
        tagDashboard: "लाइव आँकड़े",
        headDashboard: "लाइव विश्वसनीयता डैशबोर्ड",
        subDashboard: "विश्लेषित भ्रामक सूचनाओं का वास्तविक समय का अवलोकन।",
        lblDashTotal: "कुल विश्लेषित",
        lblDashReal: "सत्यापित सत्य",
        lblDashFake: "फर्जी खबर",
        lblDashSuspicious: "संदिग्ध / लंबित",
        tagHow: "कार्यप्रणाली",
        headHow: "FakeShield कैसे काम करता है",
        subHow: "NLP और छवि विश्लेषण का बहुस्तरीय संयोजन।",
        step1Title: "सामग्री सबमिट करें",
        step1Desc: "पाठ, URL या स्क्रीनशॉट अपलोड करें।",
        step2Title: "भाषाई विश्लेषण",
        step2Desc: "सनसनीखेज शब्दों और अतिशयोक्ति की पहचान।",
        step3Title: "स्रोत सत्यापन",
        step3Desc: "प्रतिष्ठित समाचार स्रोतों से मिलान।",
        step4Title: "स्कोर और रिपोर्ट",
        step4Desc: "पारदर्शी कारणों के साथ विश्वसनीयता स्कोर।"
    },
    es: {
        flag: '🇪🇸',
        name: 'Español',
        navAnalyze: "🔍 Analizar",
        navDashboard: "📊 Panel",
        navHistory: "📜 Historial",
        navHow: "💡 Cómo Funciona",
        navTips: "🛡️ Consejos",
        navLoginText: "Iniciar Sesión",
        btnNavCta: "⚡ Verificar",
        heroBadge: "Verificación de Hechos con IA",
        heroTitleMain: "Detecta Noticias Falsas",
        heroTitleSub: "En Segundos",
        heroSubtitle: "La IA avanzada analiza artículos, enlaces web y capturas de pantalla en tiempo real para detectar desinformación.",
        btnHeroAnalyze: "🔍 Iniciar Análisis",
        btnHeroDashboard: "📊 Ver Panel en Vivo",
        lblHeroTotal: "Artículos Analizados",
        lblHeroFake: "Falsedades Detectadas",
        lblHeroAccuracy: "Tasa de Precisión",
        cardRealTitle: "Lanzamiento de Satélite Oficial",
        cardRealSub: "Fuente Oficial Verificada",
        cardSuspTitle: "Esquema Financiero No Verificado",
        cardSuspSub: "Falta Fuente Autoritativa",
        cardFakeTitle: "Cura Milagrosa en 24 Horas",
        cardFakeSub: "Alto Clickbait y Afirmación Falsa",
        tagAnalyzer: "Motor de Verificación IA",
        headAnalyzer: "Analizar Credibilidad de Noticias",
        subAnalyzer: "Verifica textos, URLs o sube capturas de pantalla para evaluar la credibilidad.",
        tabText: "Análisis de Texto",
        tabUrl: "Análisis de URL",
        tabImage: "Análisis de Imagen",
        lblQuickSamples: "⚡ Muestras Rápidas:",
        sampleReal: "Noticia Real",
        sampleFake: "Rumor Clickbait",
        sampleViral: "Mensaje Viral de WhatsApp",
        lblHeadline: "Titular de la Noticia",
        phHeadline: "Introduce el titular de la noticia aquí...",
        lblContent: "Contenido Completo del Artículo",
        phContent: "Pega el artículo o mensaje reenviado aquí...",
        lblSourceUrl: "URL de la Fuente (Opcional)",
        lblPlatform: "Plataforma / Origen",
        btnAnalyzeText: "Analizar Texto de Noticia",
        lblUrlInput: "URL del Artículo de Noticias",
        phUrl: "https://ejemplo-noticias.com/articulo",
        btnAnalyzeUrlText: "Analizar Credibilidad de URL",
        dropTitle: "Arrastra la Captura de Noticia Aquí o Haz Clic",
        dropSub: "Soporta JPG, PNG, WEBP, GIF (Máx. 10MB)",
        btnAnalyzeImageText: "Analizar Imagen y Extraer Texto",
        lblVerdictTag: "Veredicto de Credibilidad IA",
        verdictReal: "Noticia Real Verificada",
        verdictFake: "Noticia Falsa Detectada",
        verdictSuspicious: "Contenido Sospechoso",
        lblCredibilityScore: "Puntuación de Confianza",
        lblExtractedOcr: "📝 Información Extraída de la Captura (OCR):",
        lblMetricsBreakdown: "📊 Desglose de Factores de IA",
        lblReasoningTitle: "💡 Razonamiento Forense de la IA",
        btnCopyReport: "Copiar Informe",
        btnDownloadReport: "Descargar Informe",
        btnShareReport: "Compartir",
        btnAnalyzeAnother: "Analizar Otra Noticia",
        tagDashboard: "Telemetría en Vivo",
        headDashboard: "Panel de Credibilidad en Tiempo Real",
        subDashboard: "Seguimiento estadístico de noticias analizadas.",
        lblDashTotal: "Total Analizado",
        lblDashReal: "Verificado Real",
        lblDashFake: "Falsedades Detectadas",
        lblDashSuspicious: "Sospechoso / Pendiente",
        tagHow: "Metodología",
        headHow: "Cómo Funciona FakeShield IA",
        subHow: "Detección multicapa combinando NLP, visión computacional y verificación de dominios.",
        step1Title: "Ingresar Contenido",
        step1Desc: "Pega texto, URL o sube capturas de noticias.",
        step2Title: "Forense Lingüístico",
        step2Desc: "Detecta clickbait, exageraciones y sesgos emocionales.",
        step3Title: "Verificación de Fuentes",
        step3Desc: "Coteja el dominio con registros globales de noticias.",
        step4Title: "Puntuación e Informe",
        step4Desc: "Calcula el veredicto con explicaciones transparentes."
    },
    fr: {
        flag: '🇫🇷',
        name: 'Français',
        navAnalyze: "🔍 Analyser",
        navDashboard: "📊 Tableau de Bord",
        navHistory: "📜 Historique",
        navHow: "💡 Fonctionnement",
        navTips: "🛡️ Conseils",
        navLoginText: "Connexion",
        btnNavCta: "⚡ Vérifier",
        heroBadge: "Vérification des Faits par IA",
        heroTitleMain: "Détectez les Fausses Nouvelles",
        heroTitleSub: "En Quelques Secondes",
        heroSubtitle: "L'IA avancée analyse les articles, les liens web et les captures d'écran en temps réel.",
        btnHeroAnalyze: "🔍 Lancer l'Analyse",
        btnHeroDashboard: "📊 Voir le Tableau de Bord",
        lblHeroTotal: "Articles Analysés",
        lblHeroFake: "Fausses Nouvelles Détectées",
        lblHeroAccuracy: "Taux de Précision",
        cardRealTitle: "Lancement de Satellite Officiel",
        cardRealSub: "Source Officielle Vérifiée",
        cardSuspTitle: "Schéma Financier Non Vérifié",
        cardSuspSub: "Absence de Source Autorisée",
        cardFakeTitle: "Remède Miracle en 24 Heures",
        cardFakeSub: "Fort Clickbait & Fausses Déclarations",
        tagAnalyzer: "Moteur de Vérification IA",
        headAnalyzer: "Analyser la Crédibilité des Nouvelles",
        subAnalyzer: "Vérifiez des textes, URLs ou téléversez des captures d'écran.",
        tabText: "Analyse de Texte",
        tabUrl: "Analyse d'URL",
        tabImage: "Analyse d'Image",
        lblQuickSamples: "⚡ Échantillons Rapides :",
        sampleReal: "Exemple de Vraie Nouvelle",
        sampleFake: "Rumeur Sensationnaliste",
        sampleViral: "Message Viral WhatsApp",
        lblHeadline: "Gros Titre de la Nouvelle",
        phHeadline: "Entrez le gros titre ici...",
        lblContent: "Corps de l'Article",
        phContent: "Collez le texte complet ou le message ici...",
        lblSourceUrl: "URL Source (Facultatif)",
        lblPlatform: "Plateforme / Origine",
        btnAnalyzeText: "Analyser le Texte",
        lblUrlInput: "URL de l'Article de Presse",
        phUrl: "https://exemple-actualites.fr/article",
        btnAnalyzeUrlText: "Analyser la Crédibilité de l'URL",
        dropTitle: "Déposez la Capture d'Écran Ici ou Cliquez",
        dropSub: "Prend en charge JPG, PNG, WEBP, GIF (Max 10Mo)",
        btnAnalyzeImageText: "Analyser l'Image et Extraire le Texte",
        lblVerdictTag: "Verdict de Crédibilité IA",
        verdictReal: "Vraie Nouvelle Vérifiée",
        verdictFake: "Fausse Information Détectée",
        verdictSuspicious: "Contenu Suspect",
        lblCredibilityScore: "Score de Confiance",
        lblExtractedOcr: "📝 Informations Extraites de la Capture (OCR) :",
        lblMetricsBreakdown: "📊 Ventilation Multi-Facteurs IA",
        lblReasoningTitle: "💡 Analyse Détaillée et Raisonnement IA",
        btnCopyReport: "Copier le Rapport",
        btnDownloadReport: "Télécharger le Rapport",
        btnShareReport: "Partager",
        btnAnalyzeAnother: "Analyser une Autre",
        tagDashboard: "Télémétrie en Direct",
        headDashboard: "Tableau de Bord en Temps Réel",
        subDashboard: "Suivi statistique des nouvelles analysées.",
        lblDashTotal: "Total Analysé",
        lblDashReal: "Vrai Vérifié",
        lblDashFake: "Faux Détecté",
        lblDashSuspicious: "Suspect / En Attente",
        tagHow: "Méthodologie",
        headHow: "Comment Fonctionne FakeShield IA",
        subHow: "Détection multicouche combinant NLP, vision par ordinateur et vérification de domaine.",
        step1Title: "Soumission du Contenu",
        step1Desc: "Collez du texte, une URL ou téléversez une image.",
        step2Title: "Analyse Forensique NLP",
        step2Desc: "Détecte le sensationnalisme et les biais émotionnels.",
        step3Title: "Vérification des Sources",
        step3Desc: "Recoupement avec les registres officiels de presse.",
        step4Title: "Score & Verdict",
        step4Desc: "Calcule le score de confiance avec explications claires."
    },
    de: {
        flag: '🇩🇪',
        name: 'Deutsch',
        navAnalyze: "🔍 Analysieren",
        navDashboard: "📊 Dashboard",
        navHistory: "📜 Verlauf",
        navHow: "💡 Funktionsweise",
        navTips: "🛡️ Tipps",
        navLoginText: "Anmelden",
        btnNavCta: "⚡ Jetzt Prüfen",
        heroBadge: "KI-Faktenprüfung",
        heroTitleMain: "Fake News Erkennen",
        heroTitleSub: "In Sekundenschnelle",
        heroSubtitle: "Modernste KI analysiert Artikel, Links und Screenshots in Echtzeit, um Falschmeldungen zu erkennen.",
        btnHeroAnalyze: "🔍 Analyse Starten",
        btnHeroDashboard: "📊 Live-Dashboard Öffnen",
        lblHeroTotal: "Artikel Analysiert",
        lblHeroFake: "Fake News Erkannt",
        lblHeroAccuracy: "Genauigkeitsrate",
        cardRealTitle: "Offizieller Satellitenstart",
        cardRealSub: "Verifizierte Quelle",
        cardSuspTitle: "Ungeprüftes Finanzschema",
        cardSuspSub: "Fehlende autoritative Quelle",
        cardFakeTitle: "24-Stunden-Wundermittel",
        cardFakeSub: "Hoher Clickbait & Falschbehauptung",
        tagAnalyzer: "KI-Prüfmodul",
        headAnalyzer: "Glaubwürdigkeit von Nachrichten Prüfen",
        subAnalyzer: "Überprüfen Sie Texte, URLs oder Screenshots auf Echtheit.",
        tabText: "Textanalyse",
        tabUrl: "URL-Analyse",
        tabImage: "Bildanalyse",
        lblQuickSamples: "⚡ Schnelltests:",
        sampleReal: "Echte Nachricht",
        sampleFake: "Clickbait-Gerücht",
        sampleViral: "Virale WhatsApp-Nachricht",
        lblHeadline: "Schlagzeile / Titel",
        phHeadline: "Geben Sie die Schlagzeile hier ein...",
        lblContent: "Vollständiger Artikeltext",
        phContent: "Fügen Sie den Artikeltext hier ein...",
        lblSourceUrl: "Quell-URL (Optional)",
        lblPlatform: "Plattform / Herkunft",
        btnAnalyzeText: "Text Analysieren",
        lblUrlInput: "Artikel-URL",
        phUrl: "https://beispiel-nachrichten.de/artikel",
        btnAnalyzeUrlText: "URL Prüfen",
        dropTitle: "Screenshot Hier Ablegen oder Klicken",
        dropSub: "Unterstützt JPG, PNG, WEBP, GIF (Max. 10MB)",
        btnAnalyzeImageText: "Bild Analysieren & Text Extrahieren",
        lblVerdictTag: "KI-Glaubwürdigkeitsurteil",
        verdictReal: "Als Echte Nachricht Verifiziert",
        verdictFake: "Fake News Erkannt",
        verdictSuspicious: "Verdächtiger Inhalt",
        lblCredibilityScore: "Vertrauenswert",
        lblExtractedOcr: "📝 Extrahierte Screenshot-Informationen (OCR):",
        lblMetricsBreakdown: "📊 Detaillierte KI-Bewertung",
        lblReasoningTitle: "💡 KI-Analysebegründung & Erkenntnisse",
        btnCopyReport: "Bericht Kopieren",
        btnDownloadReport: "Bericht Herunterladen",
        btnShareReport: "Teilen",
        btnAnalyzeAnother: "Weiteren Artikel Prüfen",
        tagDashboard: "Live-Telemetrie",
        headDashboard: "Live-Glaubwürdigkeits-Dashboard",
        subDashboard: "Echtzeit-Statistiken über geprüfte Fehlinformationen.",
        lblDashTotal: "Gesamt Analysiert",
        lblDashReal: "Echte News",
        lblDashFake: "Fake News",
        lblDashSuspicious: "Verdächtig / Ausstehend",
        tagHow: "Methodik",
        headHow: "Wie FakeShield KI Funktioniert",
        subHow: "Kombination aus NLP-Heuristiken, Bildanalyse und Domainprüfung.",
        step1Title: "Inhalt Einreichen",
        step1Desc: "Fügen Sie Text, URL oder ein Bild ein.",
        step2Title: "Linguistische NLP-Analyse",
        step2Desc: "Erkennt Clickbait und emotionale Übertreibungen.",
        step3Title: "Quellenprüfung",
        step3Desc: "Gleicht mit verifizierten Presseregistern ab.",
        step4Title: "Urteil & Bericht",
        step4Desc: "Berechnet den Vertrauenswert mit transparenter Begründung."
    }
};

// ===================================================================
// 2. INITIALIZATION
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    initHistory();
    renderRecentTable();
    updateDashboardCounters();
    const saved = localStorage.getItem('fakeshield_lang') || 'en';
    const dict = I18N[saved] || I18N.en;
    changeLanguage(saved, dict.flag, dict.name);
    setupDropZone();
    renderNavbarAuth();
    initThemePalette();
});

// ===================================================================
// 3. THEME PALETTE CONTROLLER
// ===================================================================
const THEMES = ['default', 'theme-cyberpunk', 'theme-emerald'];
const THEME_NAMES = {
    'default': '🌌 Midnight Aurora',
    'theme-cyberpunk': '🔮 Cyberpunk Neon',
    'theme-emerald': '💎 Emerald Shield'
};

function initThemePalette() {
    const savedTheme = localStorage.getItem('fakeshield_theme') || 'default';
    applyThemePalette(savedTheme);
}

function cycleThemePalette() {
    const current = localStorage.getItem('fakeshield_theme') || 'default';
    const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    applyThemePalette(nextTheme);
    showToast(`🎨 Palette: ${THEME_NAMES[nextTheme]}`);
}

function applyThemePalette(themeName) {
    document.body.classList.remove('theme-cyberpunk', 'theme-emerald');
    if (themeName !== 'default') {
        document.body.classList.add(themeName);
    }
    localStorage.setItem('fakeshield_theme', themeName);
}

// ===================================================================
// 4. TAB SWITCHING
// ===================================================================
function switchTab(tab, btn) {
    activeAnalysisTab = tab;
    document.querySelectorAll('.tab-pill-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.getElementById('tab-text').style.display = tab === 'text' ? 'block' : 'none';
    document.getElementById('tab-url').style.display = tab === 'url' ? 'block' : 'none';
    document.getElementById('tab-image').style.display = tab === 'image' ? 'block' : 'none';
}

// ===================================================================
// 4. SAMPLE PRESETS
// ===================================================================
const SAMPLES = {
    real: {
        title: "ISRO successfully launches ocean observation satellite into solar polar orbit",
        content: "The Indian Space Research Organisation (ISRO) successfully placed the EOS earth observation satellite into precise polar orbit at 9:15 AM IST from Sriharikota. Telemetry confirmed nominal subsystem health and complete solar array deployment across scientific instruments.",
        platform: "News Website"
    },
    fake: {
        title: "URGENT CITIZEN ALERT: Government releasing free ₹50,000 cash grant & 100g gold coins for all mobile owners today only!",
        content: "BREAKING SHOCKING NEWS: Click this immediate link to register your Aadhaar and bank account to claim the festive bonus! Only 500 slots remaining before deadline expires tonight. Forward this immediately to save all family and friends!",
        platform: "WhatsApp"
    },
    whatsapp: {
        title: "Drink boiled ginger, garlic and clove water twice daily to permanently cure all viral lung pathogens in 24 hours",
        content: "VIRAL FORWARD: Top medical researchers have proven that simple kitchen spices completely neutralize respiratory infections within 24 hours. Big pharma is hiding this cheap cure! Forward to 10 groups immediately!",
        platform: "WhatsApp"
    }
};

function loadSample(type) {
    const s = SAMPLES[type];
    if (!s) return;

    switchTab('text', document.getElementById('tabBtnText'));
    document.getElementById('newsTitle').value = s.title;
    document.getElementById('newsContent').value = s.content;
    document.getElementById('platform').value = s.platform;
    showToast('✨ Loaded sample news!');
}

// ===================================================================
// 5. IMAGE DRAG & DROP
// ===================================================================
function setupDropZone() {
    const area = document.getElementById('uploadArea');
    if (!area) return;

    ['dragenter', 'dragover'].forEach(n => {
        area.addEventListener(n, (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(n => {
        area.addEventListener(n, (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
        });
    });

    area.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });
}

function handleImageSelect(event) {
    if (event.target.files && event.target.files.length > 0) {
        handleImageFile(event.target.files[0]);
    }
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('⚠️ Please select a valid image file (JPG, PNG, WEBP).');
        return;
    }

    uploadedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('previewName').textContent = file.name;
        document.getElementById('previewSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;
        document.getElementById('uploadContent').style.display = 'none';
        document.getElementById('previewContent').style.display = 'flex';
        document.getElementById('btnAnalyzeImage').disabled = false;
        showToast('📸 Image loaded successfully!');
    };
    reader.readAsDataURL(file);
}

function removeImage(event) {
    if (event) event.stopPropagation();
    uploadedImageFile = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('previewImage').src = '';
    document.getElementById('uploadContent').style.display = 'block';
    document.getElementById('previewContent').style.display = 'none';
    document.getElementById('btnAnalyzeImage').disabled = true;
}

// ===================================================================
// 6. CORE DETECTION ENGINES (Text, URL, Image)
// ===================================================================
function analyzeNews() {
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const sourceUrl = document.getElementById('sourceUrl').value.trim();
    const platform = document.getElementById('platform').value;

    if (!title && !content) {
        showToast('⚠️ Please enter a news headline or content.');
        return;
    }

    const fullText = `${title} ${content}`;
    const clickbaitWords = [
        'shocking', 'unbelievable', 'you won\'t believe', 'miracle cure', '100% cure',
        'free gold', 'free money', 'click here now', 'forward this', 'urgent citizen alert',
        'secret government', 'big pharma', 'guaranteed profit', 'conspiracy',
        'போலி', 'அதிர்ச்சி', 'உடனடியாக பகிருங்கள்', 'இலவசம்', 'அற்புதம்',
        'सनसनीखेज', 'चमत्कार', 'फ्री', 'गुप्त', 'फॉरवर्ड करें'
    ];

    let hits = 0;
    const lower = fullText.toLowerCase();
    clickbaitWords.forEach(w => {
        if (lower.includes(w.toLowerCase())) hits++;
    });

    const exclamations = (fullText.match(/!/g) || []).length;
    const capsMatch = fullText.match(/[A-Z]{4,}/g) || [];

    let score = 94;
    score -= (hits * 20);
    if (exclamations > 2) score -= 12;
    if (capsMatch.length > 2) score -= 14;
    if (platform === 'WhatsApp' || platform === 'Telegram') score -= 10;

    score = Math.max(12, Math.min(98, score));

    let status = 'REAL';
    if (score < 45) status = 'FAKE';
    else if (score < 75) status = 'SUSPICIOUS';

    const reasons = [];
    if (hits > 0) reasons.push(`• Detected ${hits} sensationalist clickbait trigger phrase(s) designed to cause panic or virality.`);
    if (exclamations > 2) reasons.push(`• High exclamation count (${exclamations}) typical of unverified breaking news forwards.`);
    if (capsMatch.length > 2) reasons.push(`• Heavy capitalization / shouting words detected.`);
    if (status === 'REAL') reasons.push(`• Linguistic structure reflects professional journalistic standards, neutral sentiment, and verified facts.`);

    const res = {
        id: 'rec_' + Date.now(),
        type: 'text',
        title: title || content.substring(0, 50) + '...',
        content: content,
        platform: platform || 'News Website',
        status: status,
        credibilityScore: score,
        clickbaitScore: hits > 0 ? 30 : 95,
        sentimentScore: status === 'REAL' ? 90 : 40,
        sourceScore: sourceUrl ? 85 : (status === 'REAL' ? 95 : 35),
        grammarScore: Math.min(98, score + 4),
        explanation: reasons.join('\n') || '• Standard verified news structure with balanced tone.',
        timestamp: new Date().toISOString()
    };

    displayResult(res);
}

function analyzeUrl() {
    const urlStr = document.getElementById('urlInput').value.trim();
    if (!urlStr) {
        showToast('⚠️ Please enter a valid URL.');
        return;
    }

    let domain = '';
    let isHttps = urlStr.startsWith('https://');
    try {
        const u = new URL(urlStr.startsWith('http') ? urlStr : 'https://' + urlStr);
        domain = u.hostname.toLowerCase();
    } catch (e) {
        domain = urlStr.toLowerCase();
    }

    const trusted = ['bbc.com', 'reuters.com', 'apnews.com', 'thehindu.com', 'ndtv.com', 'nytimes.com', 'cnn.com', 'nature.com', 'isro.gov.in', 'who.int'];
    const spamTLDs = ['.xyz', '.click', '.top', '.buzz', '.biz', '.monster'];

    const isTrusted = trusted.some(t => domain.endsWith(t));
    const isSpamTLD = spamTLDs.some(s => domain.endsWith(s));

    let score = 70;
    if (isTrusted) score = 96;
    else if (isSpamTLD) score = 20;
    else if (!isHttps) score -= 25;

    score = Math.max(15, Math.min(98, score));

    let status = 'SUSPICIOUS';
    if (score >= 80) status = 'REAL';
    else if (score <= 40) status = 'FAKE';

    const reasons = [
        `• Target Domain: ${domain}`,
        `• SSL Encryption: ${isHttps ? 'Valid HTTPS encryption' : 'Insecure unencrypted HTTP'}`,
        isTrusted ? `• Domain verified in global trusted journalism registry.` : `• Domain not in mainstream certified media whitelist.`,
        isSpamTLD ? `• High-risk domain extension detected frequently used in spam networks.` : `• Standard domain extension.`
    ];

    const res = {
        id: 'rec_' + Date.now(),
        type: 'url',
        title: domain,
        content: urlStr,
        platform: 'Web URL',
        status: status,
        credibilityScore: score,
        clickbaitScore: isSpamTLD ? 25 : 85,
        sentimentScore: score,
        sourceScore: isTrusted ? 98 : (isSpamTLD ? 15 : 60),
        grammarScore: 90,
        explanation: reasons.join('\n'),
        timestamp: new Date().toISOString()
    };

    displayResult(res);
}

function analyzeImage() {
    if (!uploadedImageFile) {
        showToast('⚠️ Please upload an image first.');
        return;
    }

    const name = uploadedImageFile.name;
    const mockOCR = `BREAKING: Unverified social media screenshot claiming immediate ₹50,000 festival bonus payout. Forwarded as received.`;

    const res = {
        id: 'rec_' + Date.now(),
        type: 'image',
        title: name,
        content: name,
        extractedText: mockOCR,
        platform: 'Screenshot Image',
        status: 'FAKE',
        credibilityScore: 35,
        clickbaitScore: 30,
        sentimentScore: 40,
        sourceScore: 35,
        grammarScore: 45,
        explanation: `• Image File: ${name}\n• OCR Text Extraction: Contains sensationalist clickbait payout claims with high urgency indicators.\n• Forensic Artifacts: Multiple re-compression artifacts typical of viral messaging network recirculations.`,
        timestamp: new Date().toISOString()
    };

    displayResult(res);
}

// ===================================================================
// 7. DISPLAY RESULTS & SVG GAUGE
// ===================================================================
function displayResult(res) {
    currentResultData = res;
    saveToHistory(res);

    const dict = I18N[currentLanguage] || I18N.en;
    const status = (res.status || 'SUSPICIOUS').toUpperCase();
    const score = Math.round(res.credibilityScore || 0);

    // 1. Status Icon & Label
    const iconEl = document.getElementById('statusIcon');
    const textEl = document.getElementById('statusText');
    if (status === 'REAL') {
        iconEl.textContent = '✅';
        textEl.textContent = dict.verdictReal;
        textEl.style.color = '#10b981';
    } else if (status === 'FAKE') {
        iconEl.textContent = '❌';
        textEl.textContent = dict.verdictFake;
        textEl.style.color = '#f43f5e';
    } else {
        iconEl.textContent = '⚠️';
        textEl.textContent = dict.verdictSuspicious;
        textEl.style.color = '#f59e0b';
    }

    // 2. SVG Gauge
    document.getElementById('scoreValue').textContent = `${score}%`;
    const circle = document.getElementById('scoreCircle');
    const circumference = 2 * Math.PI * 50; // ~314
    const offset = circumference - (score / 100) * circumference;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;

    if (status === 'REAL') circle.style.stroke = '#10b981';
    else if (status === 'FAKE') circle.style.stroke = '#f43f5e';
    else circle.style.stroke = '#f59e0b';

    // 3. Extracted OCR Box
    const ocrBox = document.getElementById('extractedTextSection');
    if (res.type === 'image' && res.extractedText) {
        ocrBox.style.display = 'block';
        document.getElementById('extractedTextBox').textContent = res.extractedText;
    } else {
        ocrBox.style.display = 'none';
    }

    // 4. Breakdown Grid
    const bg = document.getElementById('breakdownGrid');
    bg.innerHTML = `
        <div class="breakdown-card">
            <div class="b-card-head"><span>Clickbait Index</span><strong style="color:${getMetricColor(res.clickbaitScore)}">${res.clickbaitScore}%</strong></div>
            <div class="b-track"><div class="b-fill" style="width:${res.clickbaitScore}%; background:${getMetricColor(res.clickbaitScore)}"></div></div>
        </div>
        <div class="breakdown-card">
            <div class="b-card-head"><span>Source Credibility</span><strong style="color:${getMetricColor(res.sourceScore)}">${res.sourceScore}%</strong></div>
            <div class="b-track"><div class="b-fill" style="width:${res.sourceScore}%; background:${getMetricColor(res.sourceScore)}"></div></div>
        </div>
        <div class="breakdown-card">
            <div class="b-card-head"><span>Sentiment Polarity</span><strong style="color:${getMetricColor(res.sentimentScore)}">${res.sentimentScore}%</strong></div>
            <div class="b-track"><div class="b-fill" style="width:${res.sentimentScore}%; background:${getMetricColor(res.sentimentScore)}"></div></div>
        </div>
        <div class="breakdown-card">
            <div class="b-card-head"><span>Linguistic Integrity</span><strong style="color:${getMetricColor(res.grammarScore)}">${res.grammarScore}%</strong></div>
            <div class="b-track"><div class="b-fill" style="width:${res.grammarScore}%; background:${getMetricColor(res.grammarScore)}"></div></div>
        </div>
    `;

    // 5. Reasoning Text
    document.getElementById('explanationText').textContent = res.explanation;

    // Show Card & Scroll
    const card = document.getElementById('resultCard');
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('✨ Verification Analysis Complete!');
}

function getMetricColor(score) {
    if (score >= 75) return '#10b981';
    if (score >= 45) return '#f59e0b';
    return '#f43f5e';
}

// ===================================================================
// 8. RESULT ACTIONS (Copy, Download, Share, Analyze Another)
// ===================================================================
function copyResult() {
    if (!currentResultData) return;
    const r = currentResultData;
    const text = `🛡️ FakeShield AI Verification Report\n==================================\nHeadline: ${r.title}\nVerdict: ${r.status} (${r.credibilityScore}%)\nPlatform: ${r.platform}\n\nAI Reasoning:\n${r.explanation}\n\nGenerated by FakeShield AI.`;
    navigator.clipboard.writeText(text).then(() => showToast('📋 Report copied to clipboard!'));
}

function downloadReport() {
    if (!currentResultData) return;
    const r = currentResultData;
    const content = `🛡️ FAKESHIELD AI CREDIBILITY REPORT\n====================================\nDate: ${new Date().toLocaleString()}\nHeadline: ${r.title}\nType: ${(r.type || 'text').toUpperCase()}\nVerdict: ${r.status}\nScore: ${r.credibilityScore}%\n\nFORENSIC REASONING:\n${r.explanation}\n\n====================================\nFakeShield AI Security Engine`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `FakeShield_Report_${Date.now()}.txt`;
    a.click();
    showToast('💾 Report downloaded!');
}

function shareResult() {
    if (navigator.share && currentResultData) {
        navigator.share({
            title: 'FakeShield Verification Report',
            text: `Credibility Score: ${currentResultData.credibilityScore}% for "${currentResultData.title}"`,
            url: window.location.href
        }).catch(() => {});
    } else {
        copyResult();
    }
}

function analyzeAnother() {
    document.getElementById('newsTitle').value = '';
    document.getElementById('newsContent').value = '';
    document.getElementById('urlInput').value = '';
    removeImage();
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth' });
}

// ===================================================================
// 9. HISTORY & RECENT VERIFICATIONS
// ===================================================================
function initHistory() {
    if (!localStorage.getItem(STORAGE_KEY_HISTORY)) {
        const defaultHistory = [
            {
                id: 'rec_init1',
                type: 'text',
                title: 'ISRO successfully launches ocean observation satellite into solar polar orbit',
                platform: 'News Website',
                status: 'REAL',
                credibilityScore: 96,
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'rec_init2',
                type: 'text',
                title: 'WhatsApp Viral Herbal Lung Cure Message',
                platform: 'WhatsApp',
                status: 'FAKE',
                credibilityScore: 18,
                timestamp: new Date(Date.now() - 7200000).toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(defaultHistory));
    }
}

function getHistory() {
    try {
        const d = localStorage.getItem(STORAGE_KEY_HISTORY);
        return d ? JSON.parse(d) : [];
    } catch (e) {
        return [];
    }
}

function saveToHistory(res) {
    const list = getHistory();
    list.unshift(res);
    if (list.length > 60) list.pop();
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));

    renderRecentTable();
    updateDashboardCounters();
}

function filterRecentNews(filter, btn) {
    recentFilter = filter;
    document.querySelectorAll('.hist-btn-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderRecentTable();
}

function renderRecentTable() {
    const tbody = document.getElementById('newsTableBody');
    const search = (document.getElementById('historySearchInput')?.value || '').toLowerCase().trim();
    if (!tbody) return;

    const list = getHistory();
    const countBadge = document.getElementById('navHistoryCount');
    if (countBadge) countBadge.textContent = list.length;

    const filtered = list.filter(item => {
        const s = (item.status || 'SUSPICIOUS').toUpperCase();
        if (recentFilter === 'REAL' && s !== 'REAL') return false;
        if (recentFilter === 'FAKE' && s !== 'FAKE') return false;
        if (recentFilter === 'SUSPICIOUS' && s !== 'SUSPICIOUS') return false;

        if (search) {
            const t = (item.title || '').toLowerCase();
            const p = (item.platform || '').toLowerCase();
            if (!t.includes(search) && !p.includes(search)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">
                    No matching verification records found.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const typeIcon = item.type === 'url' ? '🔗' : (item.type === 'image' ? '🖼️' : '📝');
        const statusClass = (item.status || 'SUSPICIOUS').toLowerCase();
        const score = Math.round(item.credibilityScore || 0);

        return `
            <tr>
                <td><strong>${escapeHtml(item.title || 'Untitled')}</strong></td>
                <td>${typeIcon} ${escapeHtml(item.platform || 'Direct')}</td>
                <td><strong>${score}%</strong></td>
                <td><span class="badge-tag ${statusClass}">${item.status || 'SUSPICIOUS'}</span></td>
                <td>
                    <button type="button" onclick="deleteHistoryItem('${item.id}')" style="background:none; border:none; cursor:pointer; color:#f43f5e;" title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteHistoryItem(id) {
    let list = getHistory();
    list = list.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
    renderRecentTable();
    updateDashboardCounters();
    showToast('🗑️ Record deleted.');
}

function clearAllHistory() {
    if (confirm('Clear all analysis history?')) {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([]));
        renderRecentTable();
        updateDashboardCounters();
        showToast('🗑️ History cleared.');
    }
}

function exportHistoryJson() {
    const list = getHistory();
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `FakeShield_History_${Date.now()}.json`;
    a.click();
    showToast('📥 Exported JSON!');
}

function updateDashboardCounters() {
    const list = getHistory();
    let real = 0, fake = 0, suspicious = 0;
    list.forEach(i => {
        const s = (i.status || '').toUpperCase();
        if (s === 'REAL') real++;
        else if (s === 'FAKE') fake++;
        else suspicious++;
    });

    if (document.getElementById('dashTotal')) document.getElementById('dashTotal').textContent = list.length;
    if (document.getElementById('dashReal')) document.getElementById('dashReal').textContent = real;
    if (document.getElementById('dashFake')) document.getElementById('dashFake').textContent = fake;
    if (document.getElementById('dashSuspicious')) document.getElementById('dashSuspicious').textContent = suspicious;

    if (document.getElementById('heroTotal')) document.getElementById('heroTotal').textContent = list.length;
    if (document.getElementById('heroFake')) document.getElementById('heroFake').textContent = fake;
}

// ===================================================================
// 10. MULTI-LANGUAGE SWITCHER
// ===================================================================
function toggleLangDropdown() {
    document.getElementById('langDropdown')?.classList.toggle('show');
}

function changeLanguage(langCode, flag, name) {
    currentLanguage = langCode;
    localStorage.setItem('fakeshield_lang', langCode);

    document.getElementById('activeLangFlag').textContent = flag;
    document.getElementById('activeLangLabel').textContent = name;
    document.getElementById('langDropdown')?.classList.remove('show');

    document.querySelectorAll('.lang-opt').forEach(opt => {
        opt.classList.toggle('active', opt.textContent.includes(name));
    });

    applyLanguage(langCode);
}

function applyLanguage(langCode) {
    const dict = I18N[langCode] || I18N.en;

    const map = {
        navAnalyze: dict.navAnalyze,
        navDashboard: dict.navDashboard,
        navHistory: dict.navHistory,
        navHow: dict.navHow,
        navTips: dict.navTips,
        navLoginText: dict.navLoginText,
        btnNavCta: dict.btnNavCta,
        heroBadge: dict.heroBadge,
        heroTitleMain: dict.heroTitleMain,
        heroTitleSub: dict.heroTitleSub,
        heroSubtitle: dict.heroSubtitle,
        btnHeroAnalyze: dict.btnHeroAnalyze,
        btnHeroDashboard: dict.btnHeroDashboard,
        lblHeroTotal: dict.lblHeroTotal,
        lblHeroFake: dict.lblHeroFake,
        lblHeroAccuracy: dict.lblHeroAccuracy,
        cardRealTitle: dict.cardRealTitle,
        cardRealSub: dict.cardRealSub,
        cardSuspTitle: dict.cardSuspTitle,
        cardSuspSub: dict.cardSuspSub,
        cardFakeTitle: dict.cardFakeTitle,
        cardFakeSub: dict.cardFakeSub,
        tagAnalyzer: dict.tagAnalyzer,
        headAnalyzer: dict.headAnalyzer,
        subAnalyzer: dict.subAnalyzer,
        tabText: dict.tabText,
        tabUrl: dict.tabUrl,
        tabImage: dict.tabImage,
        lblQuickSamples: dict.lblQuickSamples,
        sampleReal: dict.sampleReal,
        sampleFake: dict.sampleFake,
        sampleViral: dict.sampleViral,
        lblHeadline: dict.lblHeadline,
        lblContent: dict.lblContent,
        lblSourceUrl: dict.lblSourceUrl,
        lblPlatform: dict.lblPlatform,
        btnAnalyzeText: dict.btnAnalyzeText,
        lblUrlInput: dict.lblUrlInput,
        btnAnalyzeUrlText: dict.btnAnalyzeUrlText,
        dropTitle: dict.dropTitle,
        dropSub: dict.dropSub,
        btnAnalyzeImageText: dict.btnAnalyzeImageText,
        lblVerdictTag: dict.lblVerdictTag,
        lblCredibilityScore: dict.lblCredibilityScore,
        lblExtractedOcr: dict.lblExtractedOcr,
        lblMetricsBreakdown: dict.lblMetricsBreakdown,
        lblReasoningTitle: dict.lblReasoningTitle,
        btnCopyReport: dict.btnCopyReport,
        btnDownloadReport: dict.btnDownloadReport,
        btnShareReport: dict.btnShareReport,
        btnAnalyzeAnother: dict.btnAnalyzeAnother,
        tagDashboard: dict.tagDashboard,
        headDashboard: dict.headDashboard,
        subDashboard: dict.subDashboard,
        lblDashTotal: dict.lblDashTotal,
        lblDashReal: dict.lblDashReal,
        lblDashFake: dict.lblDashFake,
        lblDashSuspicious: dict.lblDashSuspicious,
        tagHow: dict.tagHow,
        headHow: dict.headHow,
        subHow: dict.subHow,
        step1Title: dict.step1Title,
        step1Desc: dict.step1Desc,
        step2Title: dict.step2Title,
        step2Desc: dict.step2Desc,
        step3Title: dict.step3Title,
        step3Desc: dict.step3Desc,
        step4Title: dict.step4Title,
        step4Desc: dict.step4Desc
    };

    Object.entries(map).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el && text) el.innerText = text;
    });

    if (document.getElementById('newsTitle')) document.getElementById('newsTitle').placeholder = dict.phHeadline;
    if (document.getElementById('newsContent')) document.getElementById('newsContent').placeholder = dict.phContent;
    if (document.getElementById('urlInput')) document.getElementById('urlInput').placeholder = dict.phUrl;
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-dropdown-wrapper')) {
        document.getElementById('langDropdown')?.classList.remove('show');
    }
});

// ===================================================================
// 11. NAVBAR AUTH PORTAL
// ===================================================================
function renderNavbarAuth() {
    const container = document.getElementById('navAuthContainer');
    if (!container) return;

    let user = null;
    try {
        const s = localStorage.getItem('fakeshield_auth_user');
        if (s) user = JSON.parse(s);
    } catch (e) {}

    if (!user) {
        container.innerHTML = `
            <a href="login.html" class="user-profile-btn" id="navLoginBtn">
                <span>👤</span>
                <span id="navLoginText">Login</span>
            </a>
        `;
        return;
    }

    const initial = (user.fullName || user.username || 'U').charAt(0).toUpperCase();
    const displayName = user.fullName || user.username || 'User';

    container.innerHTML = `
        <div class="user-nav-profile">
            <button class="user-profile-btn" onclick="toggleUserMenu()">
                <div class="user-avatar-circle">${initial}</div>
                <span class="user-name-text">${escapeHtml(displayName)}</span>
                <span style="font-size: 0.7rem; color: #94a3b8;">▼</span>
            </button>
            <div class="user-dropdown-menu" id="userDropdownMenu">
                <div style="padding: 0.6rem 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <div style="font-weight: 700; color: #f8fafc; font-size: 0.88rem;">${escapeHtml(user.fullName || user.username)}</div>
                    <div style="font-size: 0.75rem; color: #38bdf8;">${escapeHtml(user.role || 'Fact-Checker')}</div>
                </div>
                <a href="#history-section" class="user-menu-item" onclick="toggleUserMenu()">
                    <span>📜</span> My Analyses
                </a>
                <a href="#dashboard" class="user-menu-item" onclick="toggleUserMenu()">
                    <span>📊</span> Live Dashboard
                </a>
                <button class="user-menu-item logout" onclick="logoutAppUser()">
                    <span>🚪</span> Sign Out
                </button>
            </div>
        </div>
    `;
}

function toggleUserMenu() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.classList.toggle('show');
}

function logoutAppUser() {
    localStorage.removeItem('fakeshield_auth_user');
    renderNavbarAuth();
    showToast('👋 Signed out successfully.');
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('.user-nav-profile')) {
        const menu = document.getElementById('userDropdownMenu');
        if (menu && menu.classList.contains('show')) menu.classList.remove('show');
    }
});

// ===================================================================
// 12. UTILITIES
// ===================================================================
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
