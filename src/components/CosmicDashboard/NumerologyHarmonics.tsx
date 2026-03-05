import type { NumerologyProfile } from '@/types/cosmic';
import CosmicGlassCard from './shared/CosmicGlassCard';
import CosmicArcGauge from './shared/CosmicArcGauge';
import CosmicStatusOrb from './shared/CosmicStatusOrb';
import CosmicDataRow from './shared/CosmicDataRow';
import CosmicInfoTooltip from './shared/CosmicInfoTooltip';
import { COSMIC_TOOLTIPS } from './config/cosmicTooltips';

interface Props {
  numerology: NumerologyProfile;
}

const DAY_MEANINGS: Record<number, string> = {
  1: 'Leadership & Initiative',
  2: 'Cooperation & Patience',
  3: 'Expression & Creativity',
  4: 'Foundation & Discipline',
  5: 'Change & Freedom',
  6: 'Harmony & Responsibility',
  7: 'Analysis & Reflection',
  8: 'Power & Abundance',
  9: 'Completion & Wisdom',
};

export default function NumerologyHarmonics({ numerology }: Props) {
  const { personalDay, universalDay, personalYear, personalMonth, isAlignmentDay } = numerology;

  return (
    <CosmicGlassCard
      accentColor={isAlignmentDay ? 'solar' : 'nebula'}
      glowIntensity={isAlignmentDay ? 'strong' : 'subtle'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] text-white/40 uppercase tracking-[0.15em] font-medium">
          Number Resonance
        </p>
        {isAlignmentDay && (
          <div className="flex items-center gap-1.5">
            <CosmicStatusOrb status="special" pulse label="ALIGNMENT DAY" />
            <CosmicInfoTooltip label="About alignment day">
              <p>{COSMIC_TOOLTIPS.alignmentDay.text}</p>
            </CosmicInfoTooltip>
          </div>
        )}
      </div>

      {/* Gauge grid */}
      <div className="grid grid-cols-2 gap-4 justify-items-center py-4">
        <div className="flex flex-col items-center">
          <CosmicArcGauge
            value={personalDay / 9}
            size={120}
            color={isAlignmentDay ? '#F6C453' : '#8B7AFF'}
            label={String(personalDay)}
            sublabel="PERSONAL DAY"
          />
          <CosmicInfoTooltip label="About personal day">
            <p>{COSMIC_TOOLTIPS.personalDay.text}</p>
          </CosmicInfoTooltip>
        </div>

        <div className="flex flex-col items-center">
          <CosmicArcGauge
            value={universalDay / 9}
            size={100}
            color="#5DD8FF"
            label={String(universalDay)}
            sublabel="UNIVERSAL DAY"
          />
          <CosmicInfoTooltip label="About universal day">
            <p>{COSMIC_TOOLTIPS.universalDay.text}</p>
          </CosmicInfoTooltip>
        </div>

        <CosmicArcGauge
          value={personalYear / 9}
          size={100}
          color="#A855F7"
          label={String(personalYear)}
          sublabel="PERSONAL YEAR"
        />

        <CosmicArcGauge
          value={personalMonth / 9}
          size={100}
          color="#22C55E"
          label={String(personalMonth)}
          sublabel="PERSONAL MONTH"
        />
      </div>

      {/* Day meaning */}
      <CosmicDataRow
        icon="✨"
        label="Today's Vibration"
        value={DAY_MEANINGS[personalDay] || ''}
        noBorder
      />
    </CosmicGlassCard>
  );
}
