import { PlantGuide, UserContext, GrowthPhase, GrowingTask } from './types';

export class GuidanceEngine {
  /**
   * Calculates the current growth phase based on days since planting.
   */
  static getCurrentPhase(guide: PlantGuide, daysSincePlanted: number): GrowthPhase | null {
    let accumulatedDays = 0;
    for (const phase of guide.phases) {
      accumulatedDays += phase.duration_days;
      if (daysSincePlanted <= accumulatedDays) {
        return phase;
      }
    }
    // If exceeded all phases, return the last one (likely harvest/maintenance)
    return guide.phases[guide.phases.length - 1] || null;
  }

  /**
   * Adjusts a guide based on user context (e.g., location, experience).
   */
  static tailorGuide(guide: PlantGuide, context: UserContext): PlantGuide {
    const tailoredPhases = guide.phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(task => {
        let adjustedFrequency = task.frequency_days;
        
        // Example logic: Indoor plants might need less water frequency
        if (context.location_type === 'indoor' && task.type === 'watering' && adjustedFrequency) {
          adjustedFrequency += 2; 
        }

        // Example logic: Beginners get more detailed descriptions
        const description = context.experience_level === 'Beginner' 
          ? `[Pro Tip for Beginners] ${task.description}`
          : task.description;

        return { ...task, frequency_days: adjustedFrequency, description };
      })
    }));

    return { ...guide, phases: tailoredPhases };
  }
}
