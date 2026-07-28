import type { Grade, AIScoreResult } from '../types/tprm';
import { Bot, AlertCircle, Shield, Lock, TrendingUp, AlertTriangle, FileCheck, Scale, Clock, Info } from 'lucide-react';

interface Props {
  result: AIScoreResult | null;
  isLoading: boolean;
  error?: string;
}

const getCategoryTheme = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('cyber')) return { icon: Shield, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
  if (normalized.includes('compliance')) return { icon: Lock, color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' };
  if (normalized.includes('stability')) return { icon: TrendingUp, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' };
  if (normalized.includes('reputation')) return { icon: AlertTriangle, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' };
  if (normalized.includes('resilience')) return { icon: FileCheck, color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' };
  if (normalized.includes('legal')) return { icon: Scale, color: '#57534e', bg: '#f5f5f4', border: '#e7e5e4' };
  if (normalized.includes('maturity')) return { icon: Clock, color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' };
  return { icon: Info, color: '#4b5563', bg: '#f9fafb', border: '#e5e7eb' };
};

export function AIScorecardView({ result, isLoading, error }: Props) {
  const getGradeColor = (grade: Grade) => {
    switch (grade) {
      case 'A': return '#10b981';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      case 'D': return '#f97316';
      case 'F': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', background: '#fff' }}>
        <div style={{ position: 'relative' }}>
          <Bot size={56} color="#6366f1" style={{ animation: 'bounce 2s infinite' }} />
        </div>
        <p style={{ color: '#475569', fontWeight: 600, fontSize: '1.1rem', marginTop: '20px' }}>Gemini AI is independently scoring this vendor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', background: '#fff' }}>
        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
          <AlertCircle size={40} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>AI Scoring Failed</h2>
        <p style={{ color: '#475569', textAlign: 'center', maxWidth: '400px' }}>{error}</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      
      {/* Header section with gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', 
        padding: '32px', 
        borderBottom: '1px solid #c7d2fe', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white',
        position: 'relative'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#c7d2fe' }}>
          <Bot size={20} />
          <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Gemini AI Evaluation</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.75rem', fontWeight: 900, letterSpacing: '-0.025em', color: 'white', lineHeight: 1 }}>{result.finalScore}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score / 950</div>
          </div>
          
          <div style={{ height: '80px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '3rem', 
              fontWeight: 900, 
              background: getGradeColor(result.grade),
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '4px solid rgba(255,255,255,0.1)'
            }}>
              {result.grade}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Grade</div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#e0e7ff', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.6, maxWidth: '600px', margin: '0 auto', fontStyle: 'italic' }}>
          "{result.summary}"
        </p>
      </div>

      {/* Categories breakdown Grid */}
      <div style={{ padding: '32px', flex: 1, background: '#f8fafc' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
          AI Category Reasoning
          <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          {result.categories?.map((cat, idx) => {
            const isPristine = cat.penaltyApplied === 0;
            const theme = getCategoryTheme(cat.name);
            const Icon = theme.icon;

            return (
              <div 
                key={idx} 
                style={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: isPristine ? '1px solid #e2e8f0' : '1px solid #fca5a5',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Card Header */}
                <div style={{ 
                  padding: '12px 16px', 
                  borderBottom: isPristine ? '1px solid ' + theme.border : '1px solid #fecaca', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: isPristine ? theme.bg : '#fef2f2'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '6px', borderRadius: '8px', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <Icon size={16} color={isPristine ? theme.color : '#ef4444'} />
                    </div>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{cat.name}</span>
                  </div>
                  
                  {isPristine ? (
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '6px', 
                      fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', 
                      background: 'white', color: '#059669', border: '1px solid #a7f3d0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      Pristine
                    </span>
                  ) : (
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '6px', 
                      fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', 
                      background: '#ef4444', color: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      -{Math.abs(cat.penaltyApplied)} Penalty
                    </span>
                  )}
                </div>
                
                {/* Card Body */}
                <div style={{ padding: '16px', flex: 1, fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, background: 'white' }}>
                  {cat.findings}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
