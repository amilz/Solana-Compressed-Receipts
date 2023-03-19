import { Item } from "./receipt-generator";

export const generateRandomItems = (numItems: number, maxPrice = 10): Item[] => {
    const items: Item[] = [];
    for (let i = 0; i < numItems; i++) {
        items.push({ item: `Item ${i + 1}`, cost: (Math.random() * maxPrice) });
    }
    return items;
};
