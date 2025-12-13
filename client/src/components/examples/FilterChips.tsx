import FilterChips from '../FilterChips';

export default function FilterChipsExample() {
  return (
    <FilterChips 
      filters={["Today's Keynotes", "Networking Tonight", "Workshops"]} 
      onFilterChange={(f) => console.log(`Selected: ${f}`)}
    />
  );
}
