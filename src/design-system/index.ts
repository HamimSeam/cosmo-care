/**
 * CosmoCare Holographic HUD Design System
 *
 * Tokens:     import { colors, glass, spacing, typography } from '@/design-system'
 * Components: import { HUDPanel, HUDStatusDot, HUDButton, ... } from '@/design-system'
 */

export * from './tokens';
export {
  STATUS_COLOR, STATUS_GLOW, STATUS_BG, STATUS_BORDER, STATUS_LABEL,
  RISK_COLOR, RISK_GLOW, RISK_BG, RISK_BORDER,
  statusToGlowColor, riskToGlowColor, scoreToStatus,
} from './status';
export * from './utils';

export { HUDPanel } from './components/HUDPanel';
export type { HUDPanelProps } from './components/HUDPanel';

export { HUDBracket } from './components/HUDBracket';

export { HolographicBorder, HolographicFrame } from './components/HolographicBorder';
export type { HolographicEdge } from './components/HolographicBorder';

export {
  HUDTitle,
  HUDLabel,
  HUDBody,
  HUDSectionTitle,
  HUDPanelHeader,
} from './components/HUDTypography';

export { HUDMetricValue } from './components/HUDMetric';
export { HUDMetricBar } from './components/HUDMetricBar';

export { HUDStatusDot, HUDStatusBadge, HUDRiskBadge } from './components/HUDStatus';

export { HUDButton, HUDDivider } from './components/HUDControls';

export { HUDScoreGauge } from './components/HUDScoreGauge';

export { CommDelayBanner } from './components/CommDelayBanner';

export { HUDScanOverlay } from './components/HUDScanOverlay';
