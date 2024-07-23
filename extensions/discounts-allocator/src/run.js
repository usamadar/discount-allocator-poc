// @ts-check
import { Decimal } from 'decimal.js';

// Function to get the index of the target line in the cart
function getTargetLineIndex(target) {
  return parseInt(target.cartLineId.slice(-1), 10);
}

// Function to calculate the current price of the target line in the cart
function calculateCurrentTargetPrice(inputCartLines, target) {
  const targetLineIndex = getTargetLineIndex(target);
  const targetLine = inputCartLines[targetLineIndex];
  return targetLine.cost.amountPerQuantity.amount * target.quantity;
}

// Function to check if a line item is on discount
function isLineOnDiscount(line) {
  const compareAtPrice = line.cost.compareAtAmountPerQuantity?.amount;
  const currentPrice = line.cost.amountPerQuantity.amount;
  return compareAtPrice && compareAtPrice > currentPrice;
}

export function run(input) {
  // Initialize all lines output discounts and displayable errors
  let allLinesOutputDiscounts = input.cart.lines.map(line => ({
    cartLineId: line.id,
    quantity: line.quantity,
    allocations: [],
  }));
  let displayableErrors = [];

  // Iterate over each discount
  for (const discount of input.discounts) {
    // Iterate over each discount proposal
    for (const proposal of discount.discountProposals) {
      // Calculate total price of all targets
      const totalTargetsPrice = proposal.targets.reduce((total, target) => {
        return total + calculateCurrentTargetPrice(input.cart.lines, target);
      }, 0);

      // Iterate over each target
      for (const target of proposal.targets) {
        const targetLineIndex = getTargetLineIndex(target);
        const targetLine = input.cart.lines[targetLineIndex];

        // Check if the line item is already on discount
        if (isLineOnDiscount(targetLine)) {
          const productTitle = targetLine.merchandise && targetLine.merchandise.__typename === 'ProductVariant'
            ? targetLine.merchandise.product.title
            : "Unknown Product";
          displayableErrors.push({
            discountId: discount.id.toString(),
            reason: `The product ${productTitle} is already on discount`,
          });
          continue; // Skip lines that are already discounted
        }

        // Calculate current target price and ratio
        const currentTargetPrice = calculateCurrentTargetPrice(input.cart.lines, target);
        const currentTargetRatio = currentTargetPrice / totalTargetsPrice;

        let lineDiscountAmount = 0.0;
        // Calculate line discount amount based on the type of the discount
        if (proposal.value.__typename === 'FixedAmount') {
          if (proposal.value.appliesToEachItem) {
            lineDiscountAmount = proposal.value.amount * target.quantity;
          } else {
            lineDiscountAmount = proposal.value.amount * currentTargetRatio;
          }
        } else if (proposal.value.__typename === 'Percentage') {
          lineDiscountAmount = (proposal.value.value / 100.0) * totalTargetsPrice * currentTargetRatio;
        }

        // Skip if the line discount amount is zero
        if (lineDiscountAmount === 0.0) {
          continue;
        }

        // Add the discount to the target line
        const targetAllocation = {
          discountProposalId: proposal.handle,
          amount: new Decimal(lineDiscountAmount),
        };
        allLinesOutputDiscounts[targetLineIndex].allocations.push(targetAllocation);
      }
    }
  }

  // Filter out lines without any discounts
  const lineDiscounts = allLinesOutputDiscounts.filter(
    outputDiscount => outputDiscount.allocations.length > 0,
  );

  // Prepare the output
  const output = {
    lineDiscounts,
    displayableErrors,
  };

  // Return the output
  return output;
}
