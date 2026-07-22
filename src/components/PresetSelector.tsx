import { PRESET_SCENARIOS } from '../engine/presets';
import type { ScenarioPreset } from '../engine/presets';
import { Sparkles } from 'lucide-react';

interface Props {
  selectedPresetId?: string;
  onSelectScenario: (preset: ScenarioPreset) => void;
}

export const PresetSelector: React.FC<Props> = ({ selectedPresetId, onSelectScenario }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
        <Sparkles size={16} color="#818cf8" /> LOAD DEMO SCENARIO PRESET:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {PRESET_SCENARIOS.map(preset => {
          const isActive = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: isActive ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#1d4ed8' : '#475569',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title={preset.description}
              onClick={() => onSelectScenario(preset)}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
