import * as React from 'react';

interface WelcomeEmailProps {
  fullName: string;
  companyName: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  fullName,
  companyName,
}) => (
  <div style={{
    fontFamily: 'sans-serif',
    backgroundColor: '#000',
    color: '#fff',
    padding: '40px',
    borderRadius: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #333'
  }}>
    <div style={{ marginBottom: '32px' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        backgroundColor: '#fff', 
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ width: '20px', height: '20px', backgroundColor: '#000', borderRadius: '4px' }} />
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>Flozy</h1>
    </div>

    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
      Bienvenue parmi nous, {fullName} !
    </h2>
    
    <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
      Nous sommes ravis de vous accueillir sur Flozy. Votre espace de travail pour <strong>{companyName}</strong> est prêt.
    </p>

    <div style={{ 
      backgroundColor: '#18181b', 
      padding: '24px', 
      borderRadius: '16px', 
      border: '1px solid #27272a',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Prochaines étapes :
      </h3>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#a1a1aa', fontSize: '14px' }}>
        <li style={{ marginBottom: '8px' }}>Ajoutez vos premiers clients.</li>
        <li style={{ marginBottom: '8px' }}>Configurez votre logo dans les paramètres pour vos factures.</li>
        <li style={{ marginBottom: '8px' }}>Créez votre premier devis en moins d'une minute.</li>
      </ul>
    </div>

    <a href="https://flozy.fr/dashboard" style={{
      display: 'inline-block',
      backgroundColor: '#fff',
      color: '#000',
      padding: '16px 32px',
      borderRadius: '12px',
      fontWeight: 'bold',
      textDecoration: 'none',
      fontSize: '16px'
    }}>
      Accéder à mon tableau de bord
    </a>

    <hr style={{ border: 'none', borderTop: '1px solid #27272a', margin: '40px 0' }} />

    <p style={{ color: '#52525b', fontSize: '12px', textAlign: 'center' }}>
      © {new Date().getFullYear()} Flozy Inc. — L'excellence opérationnelle pour les artisans.<br/>
      Si vous avez des questions, répondez simplement à cet email.
    </p>
  </div>
);
