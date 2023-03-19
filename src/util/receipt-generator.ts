import { createCanvas } from 'canvas';

// TO DO add some custom variation here
// Currently this will extend height with more items added to the array but not very accomodating to variations in style (font, size, etc)

export interface Args {
  items: Item[];
  storeName: string;
  orderId: string;
}

export interface Item {
  item: string;
  cost: number;
}
export interface Response {
  fileName: string;
  image: Buffer
}

export const generateReceipt = async ({items, storeName, orderId}: Args): Promise<Response> => {
  const canvasWidth = 400;
  const lineHeight = 30;
  const padding = 20;
  const headerHeight = 140;
  const footerHeight = 60;
  const minHeight = 500;

  const itemsHeight = Math.max((items.length * (lineHeight+5)), minHeight - headerHeight - footerHeight);
  const canvasHeight = headerHeight + itemsHeight + footerHeight;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Set background color to white
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw header
  ctx.fillStyle = 'black';
  ctx.font = '24px YourFont';
  ctx.fillText(storeName, padding, 50);

  // Draw date
  ctx.font = '16px YourFont';
  const date = new Intl.DateTimeFormat('en-US').format(new Date());
  ctx.fillText(date, padding, 80);

  // Draw date
  ctx.font = '16px YourFont';
  ctx.fillText(orderId, padding, 100);

  // Draw items and costs
  ctx.font = '18px YourFont';
  let yOffset = headerHeight;

  // Draw table header
  ctx.fillText('Item', padding, yOffset);
  ctx.fillText('Cost', canvasWidth - padding - 50, yOffset);
  yOffset += 10;
  ctx.moveTo(padding, yOffset);
  ctx.lineTo(canvasWidth - padding, yOffset);
  ctx.stroke();
  yOffset += 20;

  let total = 0;
  items.forEach(({ item, cost }) => {
    ctx.fillText(item, padding + 5, yOffset);

    // Right-align the costs
    const costText = cost.toFixed(2);
    const costWidth = ctx.measureText(costText).width + 5;
    ctx.fillText(costText, canvasWidth - padding - costWidth, yOffset);

    yOffset += lineHeight;
    total += cost;
  });

  yOffset += 10;
  ctx.moveTo(padding, yOffset);
  ctx.lineTo(canvasWidth - padding, yOffset);
  ctx.stroke();
  yOffset += 20;

  // Draw total
  ctx.font = 'bold 20px YourFont';
  ctx.fillText('Total:', padding, yOffset);

  // Right-align the total
  const totalText = total.toFixed(2);
  const totalWidth = ctx.measureText(totalText).width;
  ctx.fillText(totalText, canvasWidth - padding - totalWidth, yOffset);

  // Save the image as PNG
  const buffer = canvas.toBuffer('image/png');
  return {fileName: `receipt-${Date.now()}.png`, image: buffer} as Response;

  // Alt to use to save Receipt locally fs.writeFileSync(`./receipts/receipt-${Date.now()}.png`, buffer);
};

