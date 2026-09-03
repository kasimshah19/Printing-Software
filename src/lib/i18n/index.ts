export type TranslationKey =
  | "app.title"
  | "app.tagline"
  | "nav.dashboard"
  | "nav.editor"
  | "nav.templates"
  | "nav.settings"
  | "nav.print"
  | "nav.jobs"
  | "nav.billing"
  | "nav.fileTools"
  | "nav.customers"
  | "nav.reports"
  | "dashboard.quickActions"
  | "dashboard.passportPhoto"
  | "dashboard.idCard"
  | "dashboard.a4Sheet"
  | "dashboard.customPrint"
  | "dashboard.recentProjects"
  | "dashboard.noRecentProjects"
  | "dashboard.todayStats"
  | "dashboard.totalJobs"
  | "dashboard.printed"
  | "dashboard.pending"
  | "editor.upload"
  | "editor.crop"
  | "editor.rotate"
  | "editor.templates"
  | "editor.layout"
  | "editor.preview"
  | "editor.print"
  | "editor.save"
  | "editor.undo"
  | "editor.redo"
  | "editor.reset"
  | "editor.brightness"
  | "editor.contrast"
  | "editor.saturation"
  | "editor.grayscale"
  | "editor.delete"
  | "editor.duplicate"
  | "editor.noImage"
  | "uploader.dragDrop"
  | "uploader.paste"
  | "uploader.supported"
  | "paper.size"
  | "paper.orientation"
  | "paper.margins"
  | "paper.spacing"
  | "paper.copies"
  | "print.title"
  | "print.backToEditor"
  | "print.instructions"
  | "print.fitScreen"
  | "print.actualSize"
  | "templates.builtIn"
  | "templates.user"
  | "templates.create"
  | "settings.printing"
  | "settings.photo"
  | "settings.application"
  | "settings.data"
  | "settings.clearData"
  | "settings.saved"
  | "error.unsupportedImage"
  | "error.tooLarge"
  | "error.generic"
  | "batch.title"
  | "batch.autoCrop"
  | "batch.processing"
  | "batch.complete"
  | "batch.progress"
  | "batch.failed"
  | "jobs.title"
  | "jobs.newJob"
  | "jobs.customer"
  | "jobs.service"
  | "jobs.copies"
  | "jobs.status"
  | "jobs.notes"
  | "jobs.pending"
  | "jobs.processing"
  | "jobs.printed"
  | "jobs.completed"
  | "jobs.cancelled"
  | "jobs.noJobs"
  | "jobs.markPrinted"
  | "jobs.markCompleted"
  | "jobs.cancel"
  | "jobs.delete"
  | "jobs.all"
  | "jobs.filterByStatus"
  | "billing.title"
  | "billing.newInvoice"
  | "billing.invoiceNumber"
  | "billing.customer"
  | "billing.date"
  | "billing.items"
  | "billing.service"
  | "billing.quantity"
  | "billing.rate"
  | "billing.amount"
  | "billing.subtotal"
  | "billing.total"
  | "billing.paid"
  | "billing.unpaid"
  | "billing.paymentStatus"
  | "billing.markPaid"
  | "billing.printInvoice"
  | "billing.noInvoices"
  | "billing.addItem"
  | "billing.removeItem"
  | "billing.save"
  | "billing.todaySales"
  | "billing.totalRevenue"
  | "billing.totalInvoices"
  | "tools.title"
  | "tools.compressor"
  | "tools.signature"
  | "tools.targetSize"
  | "tools.originalSize"
  | "tools.compressedSize"
  | "tools.download"
  | "tools.calculating"
  | "tools.success";

const en: Record<TranslationKey, string> = {
  "app.title": "CyberCafe Print",
  "app.tagline": "Fast photo & ID card printing for shops",
  "nav.dashboard": "Dashboard",
  "nav.editor": "Editor",
  "nav.templates": "Templates",
  "nav.settings": "Settings",
  "nav.print": "Print Preview",
  "nav.jobs": "Jobs",
  "nav.billing": "Billing",
  "nav.fileTools": "File Tools",
  "nav.customers": "Customers",
  "nav.reports": "Reports",
  "dashboard.quickActions": "Quick Actions",
  "dashboard.passportPhoto": "Passport Photo",
  "dashboard.idCard": "ID Card",
  "dashboard.a4Sheet": "A4 Photo Sheet",
  "dashboard.customPrint": "Custom Print",
  "dashboard.recentProjects": "Recent Projects",
  "dashboard.noRecentProjects": "No recent projects yet",
  "dashboard.todayStats": "Today's Stats",
  "dashboard.totalJobs": "Total Jobs",
  "dashboard.printed": "Printed",
  "dashboard.pending": "Pending",
  "editor.upload": "Upload",
  "editor.crop": "Crop",
  "editor.rotate": "Rotate",
  "editor.templates": "Templates",
  "editor.layout": "Layout",
  "editor.preview": "Preview",
  "editor.print": "Print",
  "editor.save": "Save",
  "editor.undo": "Undo",
  "editor.redo": "Redo",
  "editor.reset": "Reset",
  "editor.brightness": "Brightness",
  "editor.contrast": "Contrast",
  "editor.saturation": "Saturation",
  "editor.grayscale": "Grayscale",
  "editor.delete": "Delete",
  "editor.duplicate": "Duplicate",
  "editor.noImage": "Upload an image to begin",
  "uploader.dragDrop": "Drag & drop images here",
  "uploader.paste": "or paste from clipboard (Ctrl+V)",
  "uploader.supported": "JPG, PNG, WEBP supported",
  "paper.size": "Paper Size",
  "paper.orientation": "Orientation",
  "paper.margins": "Margins (mm)",
  "paper.spacing": "Spacing (mm)",
  "paper.copies": "Copies",
  "print.title": "Print Preview",
  "print.backToEditor": "Back to Editor",
  "print.instructions": "Printer Settings",
  "print.fitScreen": "Fit to Screen",
  "print.actualSize": "Actual Size",
  "templates.builtIn": "Built-in Templates",
  "templates.user": "My Templates",
  "templates.create": "Create Template",
  "settings.printing": "Printing",
  "settings.photo": "Photo Defaults",
  "settings.application": "Application",
  "settings.data": "Data",
  "settings.clearData": "Clear All Local Data",
  "settings.saved": "Settings saved",
  "error.unsupportedImage": "Unsupported image format. Use JPG, PNG, or WEBP.",
  "error.tooLarge": "This image is too large to process safely. Try a smaller image.",
  "error.generic": "Something went wrong. Please try again.",
  "batch.title": "Batch Processing",
  "batch.autoCrop": "Auto Crop All",
  "batch.processing": "Processing...",
  "batch.complete": "Batch complete!",
  "batch.progress": "Progress",
  "batch.failed": "Some images failed to process",
  "jobs.title": "Job Queue",
  "jobs.newJob": "New Job",
  "jobs.customer": "Customer",
  "jobs.service": "Service",
  "jobs.copies": "Copies",
  "jobs.status": "Status",
  "jobs.notes": "Notes",
  "jobs.pending": "Pending",
  "jobs.processing": "Processing",
  "jobs.printed": "Printed",
  "jobs.completed": "Completed",
  "jobs.cancelled": "Cancelled",
  "jobs.noJobs": "No jobs yet",
  "jobs.markPrinted": "Mark Printed",
  "jobs.markCompleted": "Mark Completed",
  "jobs.cancel": "Cancel Job",
  "jobs.delete": "Delete",
  "jobs.all": "All",
  "jobs.filterByStatus": "Filter by Status",
  "billing.title": "Billing",
  "billing.newInvoice": "New Invoice",
  "billing.invoiceNumber": "Invoice #",
  "billing.customer": "Customer Name",
  "billing.date": "Date",
  "billing.items": "Items",
  "billing.service": "Service",
  "billing.quantity": "Qty",
  "billing.rate": "Rate (₹)",
  "billing.amount": "Amount (₹)",
  "billing.subtotal": "Subtotal",
  "billing.total": "Total",
  "billing.paid": "Paid",
  "billing.unpaid": "Unpaid",
  "billing.paymentStatus": "Payment Status",
  "billing.markPaid": "Mark as Paid",
  "billing.printInvoice": "Print Invoice",
  "billing.noInvoices": "No invoices yet",
  "billing.addItem": "Add Item",
  "billing.removeItem": "Remove",
  "billing.save": "Save Invoice",
  "billing.todaySales": "Today's Sales",
  "billing.totalRevenue": "Total Revenue",
  "billing.totalInvoices": "Total Invoices",
  "tools.title": "File Tools",
  "tools.compressor": "Image Compressor",
  "tools.signature": "Signature Tool",
  "tools.targetSize": "Target Size (KB)",
  "tools.originalSize": "Original Size",
  "tools.compressedSize": "Compressed Size",
  "tools.download": "Download File",
  "tools.calculating": "Compressing...",
  "tools.success": "Done!",
};

const hi: Record<TranslationKey, string> = {
  "app.title": "साइबर कैफे प्रिंट",
  "app.tagline": "दुकानों के लिए तेज़ फोटो और आईडी कार्ड प्रिंटिंग",
  "nav.dashboard": "डैशबोर्ड",
  "nav.editor": "एडिटर",
  "nav.templates": "टेम्पलेट",
  "nav.settings": "सेटिंग्स",
  "nav.print": "प्रिंट प्रीव्यू",
  "nav.jobs": "जॉब्स",
  "nav.billing": "बिलिंग",
  "nav.fileTools": "फाइल टूल्स",
  "nav.customers": "ग्राहक",
  "nav.reports": "रिपोर्ट",
  "dashboard.quickActions": "त्वरित कार्य",
  "dashboard.passportPhoto": "पासपोर्ट फोटो",
  "dashboard.idCard": "आईडी कार्ड",
  "dashboard.a4Sheet": "A4 फोटो शीट",
  "dashboard.customPrint": "कस्टम प्रिंट",
  "dashboard.recentProjects": "हाल के प्रोजेक्ट",
  "dashboard.noRecentProjects": "अभी कोई हाल का प्रोजेक्ट नहीं",
  "dashboard.todayStats": "आज के आंकड़े",
  "dashboard.totalJobs": "कुल जॉब्स",
  "dashboard.printed": "प्रिंट हो चुके",
  "dashboard.pending": "बाकी है",
  "editor.upload": "अपलोड",
  "editor.crop": "क्रॉप",
  "editor.rotate": "घुमाएं",
  "editor.templates": "टेम्पलेट",
  "editor.layout": "लेआउट",
  "editor.preview": "प्रीव्यू",
  "editor.print": "प्रिंट",
  "editor.save": "सेव",
  "editor.undo": "पूर्ववत",
  "editor.redo": "फिर से करें",
  "editor.reset": "रीसेट",
  "editor.brightness": "चमक",
  "editor.contrast": "कंट्रास्ट",
  "editor.saturation": "संतृप्ति",
  "editor.grayscale": "श्वेत-श्याम",
  "editor.delete": "मिटाएं",
  "editor.duplicate": "डुप्लिकेट",
  "editor.noImage": "शुरू करने के लिए एक फोटो अपलोड करें",
  "uploader.dragDrop": "फोटो यहां ड्रैग और ड्रॉप करें",
  "uploader.paste": "या क्लिपबोर्ड से पेस्ट करें (Ctrl+V)",
  "uploader.supported": "JPG, PNG, WEBP सपोर्टेड",
  "paper.size": "कागज़ का आकार",
  "paper.orientation": "ओरिएंटेशन",
  "paper.margins": "मार्जिन (mm)",
  "paper.spacing": "स्पेसिंग (mm)",
  "paper.copies": "कॉपियां",
  "print.title": "प्रिंट प्रीव्यू",
  "print.backToEditor": "एडिटर पर वापस",
  "print.instructions": "प्रिंटर सेटिंग्स",
  "print.fitScreen": "स्क्रीन पर फिट करें",
  "print.actualSize": "असली आकार",
  "templates.builtIn": "बिल्ट-इन टेम्पलेट",
  "templates.user": "मेरे टेम्पलेट",
  "templates.create": "टेम्पलेट बनाएं",
  "settings.printing": "प्रिंटिंग",
  "settings.photo": "फोटो डिफ़ॉल्ट",
  "settings.application": "एप्लिकेशन",
  "settings.data": "डेटा",
  "settings.clearData": "सभी लोकल डेटा मिटाएं",
  "settings.saved": "सेटिंग्स सेव हो गईं",
  "error.unsupportedImage": "असमर्थित फोटो फॉर्मेट। JPG, PNG या WEBP इस्तेमाल करें।",
  "error.tooLarge": "यह फोटो प्रोसेस करने के लिए बहुत बड़ी है। छोटी फोटो आज़माएं।",
  "error.generic": "कुछ गलत हो गया। कृपया दोबारा कोशिश करें।",
  "batch.title": "बैच प्रोसेसिंग",
  "batch.autoCrop": "सभी ऑटो क्रॉप",
  "batch.processing": "प्रोसेस हो रहा है...",
  "batch.complete": "बैच पूरा!",
  "batch.progress": "प्रगति",
  "batch.failed": "कुछ फोटो प्रोसेस नहीं हो सकीं",
  "jobs.title": "जॉब कतार",
  "jobs.newJob": "नया जॉब",
  "jobs.customer": "ग्राहक",
  "jobs.service": "सेवा",
  "jobs.copies": "कॉपियां",
  "jobs.status": "स्थिति",
  "jobs.notes": "नोट्स",
  "jobs.pending": "बाकी",
  "jobs.processing": "प्रोसेसिंग",
  "jobs.printed": "प्रिंट हो चुका",
  "jobs.completed": "पूरा हो गया",
  "jobs.cancelled": "रद्द",
  "jobs.noJobs": "अभी कोई जॉब नहीं",
  "jobs.markPrinted": "प्रिंट हो गया",
  "jobs.markCompleted": "पूरा हो गया",
  "jobs.cancel": "जॉब रद्द करें",
  "jobs.delete": "मिटाएं",
  "jobs.all": "सभी",
  "jobs.filterByStatus": "स्थिति से फ़िल्टर",
  "billing.title": "बिलिंग",
  "billing.newInvoice": "नया बिल",
  "billing.invoiceNumber": "बिल नं.",
  "billing.customer": "ग्राहक का नाम",
  "billing.date": "तारीख",
  "billing.items": "आइटम",
  "billing.service": "सेवा",
  "billing.quantity": "मात्रा",
  "billing.rate": "दर (₹)",
  "billing.amount": "रकम (₹)",
  "billing.subtotal": "उप-योग",
  "billing.total": "कुल",
  "billing.paid": "भुगतान हो गया",
  "billing.unpaid": "भुगतान बाकी",
  "billing.paymentStatus": "भुगतान स्थिति",
  "billing.markPaid": "भुगतान हो गया",
  "billing.printInvoice": "बिल प्रिंट करें",
  "billing.noInvoices": "अभी कोई बिल नहीं",
  "billing.addItem": "आइटम जोड़ें",
  "billing.removeItem": "हटाएं",
  "billing.save": "बिल सेव करें",
  "billing.todaySales": "आज की बिक्री",
  "billing.totalRevenue": "कुल आय",
  "billing.totalInvoices": "कुल बिल",
  "tools.title": "फाइल टूल्स",
  "tools.compressor": "इमेज कंप्रेसर",
  "tools.signature": "सिग्नेचर टूल",
  "tools.targetSize": "लक्ष्य आकार (KB)",
  "tools.originalSize": "मूल आकार",
  "tools.compressedSize": "कंप्रेस्ड आकार",
  "tools.download": "फाइल डाउनलोड करें",
  "tools.calculating": "कंप्रेस हो रहा है...",
  "tools.success": "पूरा हुआ!",
};

const mr: Record<TranslationKey, string> = {
  "app.title": "सायबर कॅफे प्रिंट",
  "app.tagline": "दुकानांसाठी जलद फोटो आणि आयडी कार्ड प्रिंटिंग",
  "nav.dashboard": "डॅशबोर्ड",
  "nav.editor": "एडिटर",
  "nav.templates": "टेम्पलेट",
  "nav.settings": "सेटिंग्ज",
  "nav.print": "प्रिंट प्रीव्ह्यू",
  "nav.jobs": "जॉब्ज",
  "nav.billing": "बिलिंग",
  "nav.fileTools": "फाईल टूल्स",
  "nav.customers": "ग्राहक",
  "nav.reports": "अहवाल",
  "dashboard.quickActions": "जलद कृती",
  "dashboard.passportPhoto": "पासपोर्ट फोटो",
  "dashboard.idCard": "आयडी कार्ड",
  "dashboard.a4Sheet": "A4 फोटो शीट",
  "dashboard.customPrint": "कस्टम प्रिंट",
  "dashboard.recentProjects": "अलीकडील प्रोजेक्ट",
  "dashboard.noRecentProjects": "अद्याप कोणताही प्रोजेक्ट नाही",
  "dashboard.todayStats": "आजचे आकडे",
  "dashboard.totalJobs": "एकूण जॉब्ज",
  "dashboard.printed": "प्रिंट झाले",
  "dashboard.pending": "प्रलंबित",
  "editor.upload": "अपलोड",
  "editor.crop": "क्रॉप",
  "editor.rotate": "फिरवा",
  "editor.templates": "टेम्पलेट",
  "editor.layout": "लेआउट",
  "editor.preview": "प्रीव्ह्यू",
  "editor.print": "छापा",
  "editor.save": "सेव्ह",
  "editor.undo": "मागे घ्या",
  "editor.redo": "पुन्हा करा",
  "editor.reset": "रीसेट",
  "editor.brightness": "तेजस्विता",
  "editor.contrast": "कॉन्ट्रास्ट",
  "editor.saturation": "संपृक्तता",
  "editor.grayscale": "काळा-पांढरा",
  "editor.delete": "हटवा",
  "editor.duplicate": "प्रत बनवा",
  "editor.noImage": "सुरू करण्यासाठी फोटो अपलोड करा",
  "uploader.dragDrop": "फोटो इथे ड्रॅग आणि ड्रॉप करा",
  "uploader.paste": "किंवा क्लिपबोर्डवरून पेस्ट करा (Ctrl+V)",
  "uploader.supported": "JPG, PNG, WEBP सपोर्टेड",
  "paper.size": "कागदाचा आकार",
  "paper.orientation": "ओरिएंटेशन",
  "paper.margins": "मार्जिन (mm)",
  "paper.spacing": "स्पेसिंग (mm)",
  "paper.copies": "प्रती",
  "print.title": "प्रिंट प्रीव्ह्यू",
  "print.backToEditor": "एडिटरकडे परत",
  "print.instructions": "प्रिंटर सेटिंग्ज",
  "print.fitScreen": "स्क्रीनवर फिट करा",
  "print.actualSize": "खरा आकार",
  "templates.builtIn": "बिल्ट-इन टेम्पलेट",
  "templates.user": "माझे टेम्पलेट",
  "templates.create": "टेम्पलेट तयार करा",
  "settings.printing": "प्रिंटिंग",
  "settings.photo": "फोटो डीफॉल्ट",
  "settings.application": "ॲप्लिकेशन",
  "settings.data": "डेटा",
  "settings.clearData": "सर्व लोकल डेटा मिटवा",
  "settings.saved": "सेटिंग्ज सेव्ह झाल्या",
  "error.unsupportedImage": "असमर्थित फोटो फॉरमॅट. JPG, PNG किंवा WEBP वापरा.",
  "error.tooLarge": "हा फोटो प्रक्रियेसाठी खूप मोठा आहे. लहान फोटो वापरा.",
  "error.generic": "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
  "batch.title": "बॅच प्रोसेसिंग",
  "batch.autoCrop": "सर्व ऑटो क्रॉप",
  "batch.processing": "प्रक्रिया सुरू...",
  "batch.complete": "बॅच पूर्ण!",
  "batch.progress": "प्रगती",
  "batch.failed": "काही फोटो प्रक्रिया होऊ शकले नाहीत",
  "jobs.title": "जॉब रांग",
  "jobs.newJob": "नवीन जॉब",
  "jobs.customer": "ग्राहक",
  "jobs.service": "सेवा",
  "jobs.copies": "प्रती",
  "jobs.status": "स्थिती",
  "jobs.notes": "नोट्स",
  "jobs.pending": "प्रलंबित",
  "jobs.processing": "प्रक्रियेत",
  "jobs.printed": "प्रिंट झाले",
  "jobs.completed": "पूर्ण",
  "jobs.cancelled": "रद्द",
  "jobs.noJobs": "अद्याप कोणतेही जॉब नाहीत",
  "jobs.markPrinted": "प्रिंट झाले",
  "jobs.markCompleted": "पूर्ण झाले",
  "jobs.cancel": "जॉब रद्द करा",
  "jobs.delete": "हटवा",
  "jobs.all": "सर्व",
  "jobs.filterByStatus": "स्थितीनुसार फिल्टर",
  "billing.title": "बिलिंग",
  "billing.newInvoice": "नवीन बिल",
  "billing.invoiceNumber": "बिल क्र.",
  "billing.customer": "ग्राहकाचे नाव",
  "billing.date": "तारीख",
  "billing.items": "आयटम",
  "billing.service": "सेवा",
  "billing.quantity": "प्रमाण",
  "billing.rate": "दर (₹)",
  "billing.amount": "रक्कम (₹)",
  "billing.subtotal": "उप-एकूण",
  "billing.total": "एकूण",
  "billing.paid": "भरणा झाला",
  "billing.unpaid": "भरणा बाकी",
  "billing.paymentStatus": "भरणा स्थिती",
  "billing.markPaid": "भरणा झाला म्हणून चिन्हांकित करा",
  "billing.printInvoice": "बिल प्रिंट करा",
  "billing.noInvoices": "अद्याप कोणतेही बिल नाहीत",
  "billing.addItem": "आयटम जोडा",
  "billing.removeItem": "काढा",
  "billing.save": "बिल सेव्ह करा",
  "billing.todaySales": "आजची विक्री",
  "billing.totalRevenue": "एकूण उत्पन्न",
  "billing.totalInvoices": "एकूण बिले",
  "tools.title": "फाईल टूल्स",
  "tools.compressor": "इमेज कंप्रेसर",
  "tools.signature": "स्वाक्षरी साधन",
  "tools.targetSize": "लक्ष्य आकार (KB)",
  "tools.originalSize": "मूळ आकार",
  "tools.compressedSize": "कंप्रेस्ड आकार",
  "tools.download": "फाईल डाउनलोड करा",
  "tools.calculating": "कंप्रेस होत आहे...",
  "tools.success": "पूर्ण झाले!",
};

const dictionaries = { en, hi, mr };

export type Language = keyof typeof dictionaries;

export function t(key: TranslationKey, lang: Language = "en"): string {
  const dict = dictionaries[lang];
  return (dict[key] as string | undefined) ?? en[key];
}
