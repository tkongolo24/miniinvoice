// frontend/src/utils/translations.js

export const translations = {
  en: {
    // Header
    appName: 'MiniInvoice',
    profile: 'Profile',
    logout: 'Logout',
    
    // Dashboard
    yourInvoices: 'Your Invoices',
    createInvoice: 'Create Invoice',
    noInvoicesYet: 'No invoices yet',
    createFirstInvoice: 'Create Your First Invoice',
    
    // Table headers
    invoiceNumber: 'Invoice #',
    client: 'Client',
    total: 'Total',
    status: 'Status',
    actions: 'Actions',
    
    // Actions
    view: 'View',
    edit: 'Edit',
    duplicate: 'Duplicate',
    delete: 'Delete',
    
    // Status
    unpaid: 'Unpaid',
    paid: 'Paid',
    overdue: 'Overdue',
    
    // Edit Invoice
    editInvoice: 'Edit Invoice',
    backToDashboard: 'Back to Dashboard',
    invoiceDetails: 'Invoice Details',
    clientInformation: 'Client Information',
    items: 'Items',
    notes: 'Notes',
    
    // Form labels
    invoiceNumberLabel: 'Invoice Number',
    currency: 'Currency',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    statusLabel: 'Status',
    clientName: 'Client Name',
    clientEmail: 'Client Email',
    clientAddress: 'Client Address',
    description: 'Description',
    quantity: 'Quantity',
    rate: 'Rate',
    amount: 'Amount',
    notesOptional: 'Notes (Optional)',
    
    // Buttons
    addItem: 'Add Item',
    remove: 'Remove',
    updateInvoice: 'Update Invoice',
    updating: 'Updating...',
    cancel: 'Cancel',
    
    // Messages
    loadingInvoice: 'Loading invoice...',
    cannotEditPaid: 'Cannot edit paid invoices. This protects your customer records.',
    failedToLoad: 'Failed to load invoice. Redirecting...',
    invoiceUpdated: 'Invoice updated successfully!',
    failedToUpdate: 'Failed to update invoice. Please try again.',
    
    // Placeholders
    descriptionPlaceholder: 'E.g. Web design services',
    notesPlaceholder: 'Additional notes or payment terms...',
    
    // Confirmation
    deleteConfirm: 'Are you sure you want to delete this invoice?',
    failedToDelete: 'Failed to delete invoice',
    failedToUpdateStatus: 'Failed to update status',
    
    // Loading
    loading: 'Loading...',
    
    // Create Invoice
    createNewInvoice: 'Create New Invoice',
    createButton: 'Create Invoice',
    creating: 'Creating...',

    // Login Page
    loginTitle: 'Login to MiniInvoice',
    loginSubtitle: 'Enter your credentials to access your account',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    loginError: 'Login failed. Please check your credentials.',
    
    // Register Page
    registerTitle: 'Create Account',
    registerSubtitle: 'Sign up to start creating invoices',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    companyName: 'Company Name',
    companyNamePlaceholder: 'Your Company Ltd',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    registerButton: 'Create Account',
    registering: 'Creating account...',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    registerError: 'Registration failed. Please try again.',
    passwordMismatch: 'Passwords do not match',
  },
  
  fr: {
    // Header
    appName: 'MiniFacture',
    profile: 'Profil',
    logout: 'Déconnexion',
    
    // Dashboard
    yourInvoices: 'Vos Factures',
    createInvoice: 'Créer une Facture',
    noInvoicesYet: 'Aucune facture pour le moment',
    createFirstInvoice: 'Créez votre première facture',
    
    // Table headers
    invoiceNumber: 'Facture Nº',
    client: 'Client',
    total: 'Total',
    status: 'Statut',
    actions: 'Actions',
    
    // Actions
    view: 'Voir',
    edit: 'Modifier',
    duplicate: 'Dupliquer',
    delete: 'Supprimer',
    
    // Status
    unpaid: 'Impayée',
    paid: 'Payée',
    overdue: 'En retard',
    
    // Edit Invoice
    editInvoice: 'Modifier la Facture',
    backToDashboard: 'Retour au Tableau de Bord',
    invoiceDetails: 'Détails de la Facture',
    clientInformation: 'Informations Client',
    items: 'Articles',
    notes: 'Notes',
    
    // Form labels
    invoiceNumberLabel: 'Numéro de Facture',
    currency: 'Devise',
    issueDate: 'Date d\'émission',
    dueDate: 'Date d\'échéance',
    statusLabel: 'Statut',
    clientName: 'Nom du Client',
    clientEmail: 'Email du Client',
    clientAddress: 'Adresse du Client',
    description: 'Description',
    quantity: 'Quantité',
    rate: 'Prix',
    amount: 'Montant',
    notesOptional: 'Notes (Optionnel)',
    
    // Buttons
    addItem: 'Ajouter un Article',
    remove: 'Retirer',
    updateInvoice: 'Mettre à Jour',
    updating: 'Mise à jour...',
    cancel: 'Annuler',
    
    // Messages
    loadingInvoice: 'Chargement de la facture...',
    cannotEditPaid: 'Impossible de modifier les factures payées. Cela protège vos dossiers clients.',
    failedToLoad: 'Échec du chargement. Redirection...',
    invoiceUpdated: 'Facture mise à jour avec succès!',
    failedToUpdate: 'Échec de la mise à jour. Veuillez réessayer.',
    
    // Placeholders
    descriptionPlaceholder: 'Ex: Services de conception web',
    notesPlaceholder: 'Notes supplémentaires ou conditions de paiement...',
    
    // Confirmation
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette facture?',
    failedToDelete: 'Échec de la suppression',
    failedToUpdateStatus: 'Échec de la mise à jour du statut',
    
    // Loading
    loading: 'Chargement...',
    
    // Create Invoice
    createNewInvoice: 'Créer une Nouvelle Facture',
    createButton: 'Créer la Facture',
    creating: 'Création...',

    // Login Page
    loginTitle: 'Connexion à MiniFacture',
    loginSubtitle: 'Entrez vos identifiants pour accéder à votre compte',
    email: 'Email',
    emailPlaceholder: 'vous@exemple.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    loginButton: 'Se connecter',
    loggingIn: 'Connexion...',
    noAccount: "Vous n'avez pas de compte?",
    signUp: "S'inscrire",
    loginError: 'Échec de connexion. Vérifiez vos identifiants.',
    
    // Register Page
    registerTitle: 'Créer un Compte',
    registerSubtitle: 'Inscrivez-vous pour commencer à créer des factures',
    fullName: 'Nom Complet',
    fullNamePlaceholder: 'Jean Dupont',
    companyName: 'Nom de l\'Entreprise',
    companyNamePlaceholder: 'Votre Entreprise Ltd',
    confirmPassword: 'Confirmer le Mot de Passe',
    confirmPasswordPlaceholder: 'Ressaisissez votre mot de passe',
    registerButton: 'Créer un Compte',
    registering: 'Création du compte...',
    haveAccount: 'Vous avez déjà un compte?',
    signIn: 'Se connecter',
    registerError: 'Échec de l\'inscription. Veuillez réessayer.',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
  },
  
  rw: {
    // Header
    appName: 'MiniFacture',
    profile: 'Umwirondoro',
    logout: 'Gusohoka',
    
    // Dashboard
    yourInvoices: 'Inyemezabuguzi Zawe',
    createInvoice: 'Kora Inyemezabuguzi',
    noInvoicesYet: 'Nta nyemezabuguzi uracyafite',
    createFirstInvoice: 'Kora Inyemezabuguzi Yawe ya Mbere',
    
    // Table headers
    invoiceNumber: 'Nimero',
    client: 'Umukiriya',
    total: 'Igiteranyo',
    status: 'Uko Bimeze',
    actions: 'Ibikorwa',
    
    // Actions
    view: 'Reba',
    edit: 'Hindura',
    duplicate: 'Gusubiramo',
    delete: 'Gusiba',
    
    // Status
    unpaid: 'Ntiyishyuwe',
    paid: 'Yishyuwe',
    overdue: 'Yarangiye',
    
    // Edit Invoice
    editInvoice: 'Hindura Inyemezabuguzi',
    backToDashboard: 'Subira ku Rupapuro Rukuru',
    invoiceDetails: 'Amakuru y\'Inyemezabuguzi',
    clientInformation: 'Amakuru y\'Umukiriya',
    items: 'Ibicuruzwa',
    notes: 'Inyandiko',
    
    // Form labels
    invoiceNumberLabel: 'Nimero y\'Inyemezabuguzi',
    currency: 'Ifaranga',
    issueDate: 'Itariki Yakorezweho',
    dueDate: 'Itariki yo Kwishyura',
    statusLabel: 'Uko Bimeze',
    clientName: 'Izina ry\'Umukiriya',
    clientEmail: 'Imeri y\'Umukiriya',
    clientAddress: 'Aderesi y\'Umukiriya',
    description: 'Ibisobanuro',
    quantity: 'Umubare',
    rate: 'Igiciro',
    amount: 'Amafaranga',
    notesOptional: 'Inyandiko (Bitari ngombwa)',
    
    // Buttons
    addItem: 'Ongeraho Ikintu',
    remove: 'Gukuraho',
    updateInvoice: 'Kuvugurura',
    updating: 'Birakora...',
    cancel: 'Guhagarika',
    
    // Messages
    loadingInvoice: 'Birapakurwa...',
    cannotEditPaid: 'Ntushobora guhindura inyemezabuguzi yishyuwe. Ibi birinda inyandiko z\'abakiriya bawe.',
    failedToLoad: 'Byanze gupakurwa. Urarashira...',
    invoiceUpdated: 'Inyemezabuguzi yavuguruwe neza!',
    failedToUpdate: 'Byanze kuvugurura. Ongera ugerageze.',
    
    // Placeholders
    descriptionPlaceholder: 'Urugero: Serivisi zo gukora urubuga',
    notesPlaceholder: 'Inyandiko zinyongera cyangwa amabwiriza yo kwishyura...',
    
    // Confirmation
    deleteConfirm: 'Uzi neza ko ushaka gusiba iyi nyemezabuguzi?',
    failedToDelete: 'Byanze gusiba',
    failedToUpdateStatus: 'Byanze kuvugurura',
    
    // Loading
    loading: 'Birapakurwa...',
    
    // Create Invoice
    createNewInvoice: 'Kora Inyemezabuguzi Nshya',
    createButton: 'Kora Inyemezabuguzi',
    creating: 'Birakora...',

    // Login Page
    loginTitle: 'Kwinjira muri MiniFacture',
    loginSubtitle: 'Injiza ibyangombwa byawe kugirango ubone konti yawe',
    email: 'Imeri',
    emailPlaceholder: 'wowe@urugero.com',
    password: 'Ijambo ry\'ibanga',
    passwordPlaceholder: 'Injiza ijambo ryawe ry\'ibanga',
    loginButton: 'Injira',
    loggingIn: 'Kwinjira...',
    noAccount: 'Ntufite konti?',
    signUp: 'Iyandikishe',
    loginError: 'Kwinjira byanze. Suzuma ibyangombwa byawe.',
    
    // Register Page
    registerTitle: 'Kurema Konti',
    registerSubtitle: 'Iyandikishe kugirango utangire gukora inyemezabuguzi',
    fullName: 'Amazina Yuzuye',
    fullNamePlaceholder: 'Yohani Mukiza',
    companyName: 'Izina ry\'Isosiyete',
    companyNamePlaceholder: 'Isosiyete Yanyu Ltd',
    confirmPassword: 'Emeza Ijambo ry\'ibanga',
    confirmPasswordPlaceholder: 'Ongera wandike ijambo ryawe ry\'ibanga',
    registerButton: 'Kurema Konti',
    registering: 'Kurema konti...',
    haveAccount: 'Usanzwe ufite konti?',
    signIn: 'Injira',
    registerError: 'Kwiyandikisha byanze. Ongera ugerageze.',
    passwordMismatch: 'Amagambo y\'ibanga ntabwo ahura',
  }
};

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations['en'][key] || key;
};