import type { Layer } from '../types';

interface LayerCardProps {
  layer: Layer;
  index: number;
}

export function LayerCard({ layer, index }: LayerCardProps) {
  return (
    <div
      className="card group hover:scale-[1.02] transition-all duration-300 animate-slide-up cursor-default"
      style={{
        animationDelay: `${index * 60}ms`,
        borderColor: `${layer.color}25`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${layer.color}22`, border: `1px solid ${layer.color}40` }}
        >
          {layer.icon}
        </div>
        <div>
          <h3 className="font-semibold text-white leading-tight">{layer.name}</h3>
          <p className="text-xs text-white/40 mt-0.5">{layer.description}</p>
        </div>
      </div>

      {/* Technologies */}
      <div className="mb-3">
        <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2">Stack</p>
        <div className="flex flex-wrap gap-1.5">
          {layer.technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{
                backgroundColor: `${layer.color}18`,
                color: layer.color,
                border: `1px solid ${layer.color}30`,
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2">
          Features
        </p>
        <ul className="space-y-1">
          {layer.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-white/60">
              <span
                className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                style={{ backgroundColor: layer.color }}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
