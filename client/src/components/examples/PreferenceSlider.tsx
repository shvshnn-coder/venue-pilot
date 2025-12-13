import PreferenceSlider from '../PreferenceSlider';

export default function PreferenceSliderExample() {
  return (
    <div className="space-y-4 p-4 bg-deep-teal/30 rounded-lg">
      <PreferenceSlider label="Keynotes" defaultValue={80} />
      <PreferenceSlider label="Networking" defaultValue={60} />
      <PreferenceSlider label="Workshops" defaultValue={40} />
    </div>
  );
}
