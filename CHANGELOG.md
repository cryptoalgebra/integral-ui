# Changelog

### Major Features
- **Analytics Dashboard**: 
  - Comprehensive DEX analytics with interactive charts and statistics
- **Automated Liquidity Management (ALM)**
    - Vaults management
    - Position creation and management
- **Enhanced Swap Routing**:
  - Implemented split routing through custom pools using SmartRouter
- **Modular Architecture**:
  - Key features now isolated as optional modules:
    - [Farming](src/modules/FarmingModule)
    - [Analytics](src/modules/AnalyticsModule)
    - [SmartRouter](src/modules/SmartRouterModule)
    - [ALM](src/modules/ALMModule)
    - [Limit Orders](src/modules/LimitOrdersModule)
  - Modules excluded from bundle when disabled via [feature flags](config/app-modules.ts)

### Configuration Improvements
- Centralized application configuration via [`config`](config) directory:
  - [Manage contract addresses](config/contract-addresses.ts)
  - [Configure GraphQL / API endpoints](config/graphql-urls.ts)
  - [Control supported networks](config/wagmi.ts)
  - [Enable/disable modules via flags](config/app-modules.ts)
  - [Theme and color scheme management](config/colors.css)

### UI/UX Enhancements
- Complete interface facelift with improved usability
- Theme management via config

### Technical Improvements
- **Major Dependency Updates**:
  - WalletConnect upgraded to Reown
  - Viem and Wagmi migrated from v1 → v2
  - Tailwind CSS v4 with new configuration
  - Vite build system improvements
- **Code Refactoring**:
  - Contract naming standardization
  - Updated ABIs
  - Optimized method calls with new syntax (wagmi v2)
  - Reduced redundant network requests
- **Performance**:
  - Bundle size optimization through modular architecture
