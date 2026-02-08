import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'BillKazi - Simple Invoicing for African Freelancers', 
  description = 'Create professional invoices in seconds. Built for African freelancers and SMEs with multi-currency support (RWF, KES, NGN, USD, EUR) and easy payment tracking.',
  image = 'https://yourdomain.vercel.app/og-image.png',
  url = 'https://yourdomain.vercel.app',
  type = 'website'
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content="invoice, invoicing software, freelancer tools, Rwanda invoice, Kenya invoice, Nigeria invoice, multi-currency invoice, SME tools, business invoicing, African freelancers" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;