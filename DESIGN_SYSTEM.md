# 🎨 ANDE Faucet - Design System

## 🌈 Paleta de Colores Institucional

### Colores Principales

#### 🟠 Naranja Vibrante (`#FF9F1C`)
- **Significado**: Energía, creatividad, entusiasmo, cercanía
- **Uso ideal**: Botones principales CTA, llamados a la acción, highlights
- **Ejemplos**: 
  - Botón "Request Tokens"
  - Iconos de confirmación
  - Progress indicators activos

#### 🔵 Azul Profundo (`#2455B8`)
- **Significado**: Seguridad, confianza, seriedad
- **Uso ideal**: Headers, títulos principales, links importantes
- **Ejemplos**:
  - Logo principal
  - Navigation bar
  - Footer
  - Títulos de sección

### Colores Secundarios

#### 💜 Lavanda Suave (`#BFA4FF`)
- **Significado**: Imaginación, calma, innovación
- **Uso ideal**: Fondos alternativos, tarjetas, ilustraciones
- **Ejemplos**:
  - Cards de información
  - Background de stats
  - Ilustraciones decorativas

#### 🍑 Durazno Claro (`#FFC77D`)
- **Significado**: Calidez, optimismo, amabilidad, cercanía
- **Uso ideal**: Fondos suaves, elementos secundarios
- **Ejemplos**:
  - Hover states
  - Success messages background
  - Secondary buttons

## 🎭 Variantes de Color

### Scheme Light Mode
```css
:root {
  /* Colores ANDE */
  --ande-orange: #FF9F1C;
  --ande-blue: #2455B8;
  --ande-lavender: #BFA4FF;
  --ande-peach: #FFC77D;
  
  /* Variantes Orange */
  --orange-50: #FFF8ED;
  --orange-100: #FFEDCC;
  --orange-200: #FFD999;
  --orange-300: #FFC266;
  --orange-400: #FFAB3D;
  --orange-500: #FF9F1C; /* Principal */
  --orange-600: #E68900;
  --orange-700: #B36900;
  --orange-800: #804C00;
  --orange-900: #4D2E00;
  
  /* Variantes Blue */
  --blue-50: #EBF1FA;
  --blue-100: #C7D9F0;
  --blue-200: #8FB5E0;
  --blue-300: #5791D1;
  --blue-400: #3B73C2;
  --blue-500: #2455B8; /* Principal */
  --blue-600: #1D4494;
  --blue-700: #163370;
  --blue-800: #0F224C;
  --blue-900: #081128;
  
  /* Variantes Lavender */
  --lavender-50: #F8F6FF;
  --lavender-100: #EDE8FF;
  --lavender-200: #DBD1FF;
  --lavender-300: #C9BAFF;
  --lavender-400: #BFA4FF; /* Principal */
  --lavender-500: #A888E6;
  --lavender-600: #8C6CBF;
  --lavender-700: #705099;
  --lavender-800: #543473;
  --lavender-900: #38184D;
  
  /* Variantes Peach */
  --peach-50: #FFF9F0;
  --peach-100: #FFEDCC;
  --peach-200: #FFE1AA;
  --peach-300: #FFD488;
  --peach-400: #FFC77D; /* Principal */
  --peach-500: #E6AE61;
  --peach-600: #BF8F4A;
  --peach-700: #997033;
  --peach-800: #73511C;
  --peach-900: #4D3205;
  
  /* Grises neutrales */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Semánticos */
  --success: #10B981;
  --success-bg: #D1FAE5;
  --warning: #F59E0B;
  --warning-bg: #FEF3C7;
  --error: #EF4444;
  --error-bg: #FEE2E2;
  --info: #3B82F6;
  --info-bg: #DBEAFE;
  
  /* UI Elements */
  --background: #FFFFFF;
  --surface: #F9FAFB;
  --surface-elevated: #FFFFFF;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-disabled: #9CA3AF;
  --border: #E5E7EB;
  --divider: #E5E7EB;
  --shadow: rgba(0, 0, 0, 0.1);
}
```

### Scheme Dark Mode
```css
.dark {
  /* Colores ANDE (mantienen intensidad) */
  --ande-orange: #FF9F1C;
  --ande-blue: #5791D1; /* Más claro en dark */
  --ande-lavender: #C9BAFF; /* Más claro en dark */
  --ande-peach: #FFD488; /* Más claro en dark */
  
  /* UI Elements */
  --background: #0F172A;
  --surface: #1E293B;
  --surface-elevated: #334155;
  --text-primary: #F1F5F9;
  --text-secondary: #CBD5E1;
  --text-disabled: #64748B;
  --border: #334155;
  --divider: #334155;
  --shadow: rgba(0, 0, 0, 0.5);
}
```

## 🔤 Tipografía

### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Scale
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
```

### Font Weights
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 📐 Spacing

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

## 🔲 Border Radius

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Circle */
```

## 🌟 Efectos y Animaciones

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-glow-orange: 0 0 20px 0 rgba(255, 159, 28, 0.5);
--shadow-glow-blue: 0 0 20px 0 rgba(36, 85, 184, 0.5);
```

### Gradients
```css
--gradient-hero: linear-gradient(135deg, #FF9F1C 0%, #2455B8 100%);
--gradient-card: linear-gradient(135deg, #BFA4FF 0%, #FFC77D 100%);
--gradient-button: linear-gradient(90deg, #FF9F1C 0%, #FFC77D 100%);
--gradient-lavender: linear-gradient(135deg, #BFA4FF 0%, #C9BAFF 100%);
```

### Transitions
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

## 🎯 Componentes UI

### Buttons

#### Primary Button (Orange)
```css
.btn-primary {
  background: var(--gradient-button);
  color: white;
  font-weight: var(--font-semibold);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glow-orange);
  transition: var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl), var(--shadow-glow-orange);
}
```

#### Secondary Button (Blue)
```css
.btn-secondary {
  background: var(--ande-blue);
  color: white;
  font-weight: var(--font-medium);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}
```

### Cards
```css
.card {
  background: var(--surface-elevated);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
```

### Inputs
```css
.input {
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  transition: var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--ande-orange);
  box-shadow: 0 0 0 3px rgba(255, 159, 28, 0.1);
}
```

## 📱 Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large */
```

## 🎨 Best Practices

### Do's ✅
- Usar naranja (#FF9F1C) para CTAs principales
- Usar azul (#2455B8) para elementos de confianza/seguridad
- Lavanda (#BFA4FF) para fondos y elementos decorativos
- Durazno (#FFC77D) para estados hover y éxito
- Mantener contraste mínimo 4.5:1 para texto
- Usar gradientes para elementos hero
- Aplicar micro-animaciones en interacciones

### Don'ts ❌
- No usar más de 3 colores simultáneamente
- No aplicar naranja en fondos grandes (cansancio visual)
- No mezclar gradientes sin propósito claro
- No usar lavanda para texto principal (bajo contraste)
- No olvidar el modo oscuro

## 🌐 Aplicación en Faucet

### Hero Section
- Background: Gradient hero (Orange → Blue)
- CTA Button: Gradient button (Orange → Peach)
- Text: White

### Form Section
- Background: Surface
- Card: Surface elevated con shadow
- Input border: Border default, focus orange
- Button: Primary (Orange gradient)

### Stats Cards
- Background: Lavender gradient suave
- Icons: Orange
- Text: Text primary
- Border: Peach subtle

### Success State
- Background: Peach-50
- Icon: Orange
- Text: Text primary
- Border: Peach

### Footer
- Background: Blue
- Text: White/Gray-100
- Links: Peach hover effect
