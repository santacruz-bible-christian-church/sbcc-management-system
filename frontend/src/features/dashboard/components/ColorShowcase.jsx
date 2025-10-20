import { Card } from '../../../components/ui/Card';

export const ColorShowcase = () => {
  const fillColors = [
    { name: 'White', hex: '#FFFFFF', class: 'bg-white' },
    { name: 'Cream', hex: '#FAFBFD', class: 'bg-sbcc-cream' },
    { name: 'Light Orange', hex: '#FFF5E1', class: 'bg-sbcc-light-orange' },
    { name: 'Orange', hex: '#F6C67E', class: 'bg-sbcc-orange' },
    { name: 'Dark Orange', hex: '#FDB54A', class: 'bg-sbcc-primary' },
  ];

  const textColors = [
    { name: 'White', hex: '#FFFFFF', class: 'text-white bg-gray-800' },
    { name: 'Gray', hex: '#A0A0A0', class: 'text-sbcc-gray' },
    { name: 'Dark', hex: '#383838', class: 'text-sbcc-dark' },
    { name: 'Light Orange', hex: '#F6C67E', class: 'text-sbcc-orange' },
    { name: 'Orange', hex: '#FDB54A', class: 'text-sbcc-primary' },
  ];

  return (
    <div className="space-y-6">
      <Card title="Fill Colors" subtitle="Background and container colors">
        <div className="grid grid-cols-5 gap-4">
          {fillColors.map((color) => (
            <div key={color.hex} className="text-center">
              <div
                className={`${color.class} h-24 rounded-lg border border-gray-200 mb-2`}
              />
              <p className="text-sm font-medium text-sbcc-dark">{color.name}</p>
              <p className="text-xs text-sbcc-gray">{color.hex}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Text Colors" subtitle="Typography colors">
        <div className="grid grid-cols-5 gap-4">
          {textColors.map((color) => (
            <div key={color.hex} className="text-center">
              <div className="h-24 rounded-lg border border-gray-200 mb-2 flex items-center justify-center">
                <span className={`${color.class} text-2xl font-bold`}>Aa</span>
              </div>
              <p className="text-sm font-medium text-sbcc-dark">{color.name}</p>
              <p className="text-xs text-sbcc-gray">{color.hex}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Gradient Example" variant="gradient">
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            SBCC Brand Gradient
          </h2>
          <p className="text-white/80">
            From #F6C67E to #FDB54A
          </p>
        </div>
      </Card>
    </div>
  );
};