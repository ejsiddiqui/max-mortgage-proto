---
name: admin-dashboard-design
description: Create distinctive, production-grade admin panels and data-intensive interfaces with exceptional design quality. Use this skill when building dashboards, admin interfaces, analytics platforms, data tables, form-heavy applications, or any enterprise-grade data visualization interface. Generates polished, functional code that balances information density with visual refinement.
license: Complete terms in LICENSE.txt
---

This skill guides creation of sophisticated admin dashboards and data-intensive interfaces that transcend generic template aesthetics. Implement real working code with exceptional attention to data hierarchy, visual clarity, and distinctive design choices.

The user provides dashboard requirements: admin panel, analytics interface, data management system, or enterprise application. They may include context about data types, user workflows, or technical constraints.

## Design Thinking for Data Interfaces

Before coding, understand the context and commit to a CLEAR information architecture and aesthetic direction:

- **Data Purpose**: What decisions does this data support? What actions do users take?
- **Information Hierarchy**: What's primary, secondary, tertiary? What needs immediate attention vs. deep dive?
- **User Workflow**: Are users monitoring, analyzing, managing, or configuring? Single-task focused or multi-context switching?
- **Aesthetic Identity**: Pick a distinctive direction that serves the data:
  - **Clinical Precision**: Surgical minimalism, data-first, high contrast, monospace accents
  - **Editorial Analytics**: Magazine-inspired layouts, bold typography hierarchy, deliberate whitespace
  - **Ambient Intelligence**: Soft glows, glass morphism, floating cards, depth and atmosphere
  - **Industrial Command**: Brutalist grids, terminal aesthetics, utility-first, functional beauty
  - **Organic Data**: Natural color palettes, warm tones, flowing layouts, human-centered
  - **Retro Computing**: DOS/terminal nostalgia, bitmap fonts, grid-based, high-tech vintage
  - **Luxury Executive**: Refined elegance, premium materials, sophisticated restraint
  - **Playful Metrics**: Colorful, approachable, gamified elements, delightful interactions

**CRITICAL**: Admin dashboards must balance density with clarity. Choose whether to emphasize spacious breathing room or information-rich density - both work when executed with intention.

## Data Interface Design Guidelines

### Information Architecture
- **Visual Hierarchy**: Use size, weight, color, and spacing to create clear priority levels
- **Scanning Patterns**: Support F-pattern and Z-pattern reading with strategic placement
- **Chunking**: Group related data logically. Use cards, sections, or panels with clear boundaries
- **Progressive Disclosure**: Show summaries first, details on demand. Use expandable sections, modals, or drill-down patterns
- **Status Communication**: Make states (loading, error, success, warning, empty) immediately clear

### Typography for Data
- **Distinctive Font System**: 
  - Avoid Inter, Roboto, Arial - choose characterful alternatives
  - Consider: IBM Plex (versatile data), Space Mono (monospace accent), Cirka (editorial), JetBrains Mono (code/numbers), DM Sans (geometric clarity), Manrope (modern), Cabinet Grotesk (sophisticated)
  - Pair a strong display font (for headings, metrics) with a readable text font
- **Numeric Display**: Tabular figures for aligned numbers, clear hierarchy for KPIs and metrics
- **Data Labels**: Consistent sizing and weight system. Use uppercase sparingly for labels
- **Scale System**: Define clear type scale (12px/14px/16px/20px/24px/32px/48px) and stick to it

### Color & Theme Strategy
- **Semantic Color System**: Define colors for success, warning, error, info, neutral - use consistently
- **Data Visualization Palette**: Choose 6-8 distinct colors for charts that work in both light/dark modes
- **Accent Strategy**: Use one dominant accent color for CTAs and key interactions
- **Neutral Foundation**: Build a refined gray scale (6-10 shades) that creates depth without color
- **Theme Switching**: Design with both light and dark modes in mind from the start
- **Avoid**: Purple gradients on white, generic blue (#0066FF), rainbow dashboards without purpose

### Layout & Composition
- **Grid Discipline**: Establish clear column structure (12 or 24-column). Break it intentionally, not accidentally
- **Sidebar Strategy**: Left nav, top nav, or collapsible - commit to one pattern
- **Card Design**: Consistent padding, border radius, shadow/elevation system
- **Responsive Breakpoints**: Design for desktop-first but consider tablet/mobile viewing
- **Asymmetric Balance**: Use golden ratio, rule of thirds, or deliberate imbalance for visual interest
- **Density Control**: Use spacing system (4px/8px/12px/16px/24px/32px/48px) religiously

### Charts & Data Visualization
- **Chart Selection**: Match chart type to data story (trends→line, comparison→bar, parts→donut, distribution→histogram)
- **Visual Encoding**: Use position > length > angle > area > color for importance
- **Annotations**: Add context with labels, reference lines, highlights
- **Interactivity**: Tooltips, hover states, click-to-filter, zoom capabilities
- **Color Usage**: Avoid red/green only (accessibility), use patterns/textures as backup
- **Libraries**: Recharts (React), Chart.js, D3 (custom), or creative custom visualizations

### Tables & Data Grids
- **Cell Hierarchy**: Vary font weight, size, or color to show importance
- **Row Design**: Subtle hover states, zebra striping (use sparingly), clear selection states
- **Column Width**: Auto-size for content, make resizable when possible
- **Sorting & Filtering**: Visual indicators for active sorts, accessible filter UI
- **Pagination**: Show total count, current range, and intuitive controls
- **Empty States**: Thoughtful messaging and clear CTAs when no data exists
- **Density Options**: Allow users to toggle compact/comfortable/spacious views

### Forms & Input Design
- **Input Styling**: Consistent height, padding, border treatment across all inputs
- **Label Strategy**: Top-aligned (faster scanning) or left-aligned (compact). Never placeholder-only
- **Validation**: Inline feedback, clear error messages, success confirmation
- **Multi-step Forms**: Progress indicators, save drafts, logical grouping
- **Field Groups**: Use fieldsets, clear visual separation between sections
- **Smart Defaults**: Pre-fill when possible, use sensible defaults

### Interactive Elements
- **Buttons**: Clear hierarchy (primary/secondary/tertiary), consistent sizing, distinct states
- **Loading States**: Skeleton screens, progress bars, spinners - match to context
- **Notifications**: Toast messages, inline alerts, modal dialogs - use appropriately
- **Micro-interactions**: Smooth transitions (200-300ms), subtle feedback, delightful moments
- **Keyboard Navigation**: Full keyboard support, visible focus states, logical tab order

### Motion & Animation
- **Purposeful Animation**: Use to direct attention, show relationships, provide feedback
- **Page Transitions**: Smooth route changes, staggered content reveals (animation-delay)
- **Data Updates**: Animate value changes, highlight new data, smooth chart transitions
- **Interaction Feedback**: Button presses, form submissions, toggle switches
- **Performance**: Prioritize CSS transforms and opacity. Use `will-change` sparingly
- **Respect Preferences**: Honor `prefers-reduced-motion` for accessibility

### Visual Atmosphere
- **Backgrounds**: Move beyond flat colors - subtle gradients, mesh gradients, noise textures, geometric patterns
- **Depth System**: Consistent shadow/elevation scale (0-5 levels), layering strategy
- **Glass Effects**: Backdrop blur, transparency, borders for premium feel (use purposefully)
- **Borders & Dividers**: Subtle separators, creative use of thickness and color
- **Icons**: Consistent style (outline vs. filled), appropriate sizing, semantic usage
- **Custom Details**: Unique chart styles, custom cursors, branded elements

## Implementation Standards

### Code Quality
- **Component Structure**: Reusable, composable components. Single responsibility principle
- **State Management**: Clean state handling (React useState/useReducer, or appropriate framework patterns)
- **Data Handling**: Proper loading states, error boundaries, empty states
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation, screen reader support
- **Performance**: Virtualization for long lists, debounced searches, optimized re-renders

### CSS Architecture
- **Design Tokens**: CSS variables for colors, spacing, typography, shadows
- **Utility Classes**: Use Tailwind core utilities only (no custom compilation needed)
- **Naming Convention**: Clear, consistent class names (BEM or similar if needed)
- **Responsive**: Mobile-first or desktop-first, but be intentional
- **Dark Mode**: Use CSS variables for seamless theme switching

### React-Specific (when applicable)
- **Available Libraries**: lucide-react, recharts, lodash, d3 - use these strategically
- **No localStorage/sessionStorage**: Use React state (useState/useReducer) only
- **Hooks Best Practices**: Proper dependency arrays, custom hooks for logic reuse
- **Default Props**: All components should work without required props

## Distinctive Dashboard Aesthetics

**AVOID Generic Template Patterns:**
- ❌ Generic sidebar + white content area with blue accents
- ❌ Purple gradients everywhere
- ❌ Cookie-cutter card layouts
- ❌ Stock chart defaults (default Recharts blue)
- ❌ Overused fonts (Inter, Roboto, System UI)
- ❌ Cluttered information with no breathing room
- ❌ Inconsistent spacing and alignment

**EMBRACE Distinctive Choices:**
- ✅ Unexpected but functional layout structures
- ✅ Characterful typography that serves the data
- ✅ Cohesive color stories with strategic accent usage
- ✅ Creative data visualization styles
- ✅ Thoughtful white space OR intentional density
- ✅ Micro-interactions that enhance understanding
- ✅ Atmospheric backgrounds and depth
- ✅ Consistent, refined component design system

## Design Execution Principles

1. **Intentional, Not Default**: Every choice (font, color, spacing, component) should be deliberate
2. **Cohesive Systems**: Establish design tokens and use them consistently throughout
3. **Information First**: Beauty serves clarity - never sacrifice usability for aesthetics
4. **Accessible by Design**: Color contrast, keyboard nav, screen readers built-in from start
5. **Production-Ready**: Real data handling, loading states, error cases, edge cases
6. **Distinctive Identity**: Each dashboard should have unique character appropriate to its context

**CRITICAL**: Match implementation complexity to the design vision. Rich, data-dense dashboards need sophisticated component architecture. Clean, minimal dashboards need precise attention to spacing, typography, and restraint. Excellence comes from executing the vision with precision.

Remember: Admin dashboards don't have to be boring. Create interfaces that users actually enjoy working with daily - where data clarity meets distinctive design.