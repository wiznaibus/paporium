// clamp a number between a min and max value
export const clamp = (value: number, min: number, max: number): number => (
    Math.max(Math.min(value, max), min)
);