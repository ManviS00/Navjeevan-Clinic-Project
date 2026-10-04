import WeightCard from "@/components/health/WeightCard";
import MedicationCard from "@/components/health/MedicationCard";
import NutritionCard from "@/components/health/NutritionCard";
import HydrationCard from "@/components/health/HydrationCard";

export default function HealthTab() {
  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Health
        </h2>

        <p className="text-gray-500 mt-1">
          Track your pregnancy health and wellness
        </p>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <WeightCard />

        <MedicationCard />

        <NutritionCard />

        <HydrationCard />

      </div>

    </div>
  );
}


// import WeightTab from "./WeightTab";
// import MedicationTab from "./MedicationsTab";
// import NutritionTab from "./NutritionTab";
// import SymptomsTab from "./SymptomsTab";

// export default function HealthTab() {
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//       <WeightTab />
//       <MedicationTab />
//       <NutritionTab />
//       <SymptomsTab />
//     </div>
//   );
// }