tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['DM Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace']
            },
            colors: {
                // PRD: Primary Navy #002060
                navy: {
                    50: '#F9FAFB', // Near White Background
                    100: '#E5E7EB', // Light Border
                    200: '#D1D5DB',
                    300: '#9CA3AF',
                    400: '#334D82', // Transition to Navy
                    500: '#002060', // Main
                    600: '#001A4D',
                    700: '#00133A',
                    800: '#000D26',
                    900: '#000613',
                },
                // PRD: Secondary Bright Green #05f240 -> Updated to #34a85a per user request
                neon: {
                    50: '#E8F5E9',
                    100: '#C8E6C9',
                    200: '#A5D6A7',
                    300: '#81C784',
                    400: '#66BB6A',
                    500: '#34a85a', // New Accent
                    600: '#2E7D32',
                    700: '#1B5E20',
                    800: '#1B5E20',
                    900: '#0D3311',
                }
            }
        }
    }
}
