# Test Scenario: REQ-AF-048 - Discount Dialog Display

## Requirement
**REQ-AF-048**: Display discount dialog during checkout process for all users

## Test Scenario

### Prerequisites
- Application is running locally (`npm run dev`)
- Test user account exists and is authenticated
- User has access to the purchase page
- Stripe is properly configured

### Test Steps

1. **Navigate to Purchase Page**
   - Open browser and go to `http://localhost:3000/purchase`
   - Verify the purchase page loads with course information

2. **Initiate Checkout Process**
   - Ensure user is logged in (if not, login with Google OAuth)
   - Locate the "Get Instant Access" button
   - Click the "Get Instant Access" button

3. **Verify Discount Dialog Appears**
   - Confirm a modal dialog opens with title "Have a Discount Code?"
   - Verify dialog contains:
     - Description: "Enter your affiliate discount code to get 10% off your purchase"
     - Input field with placeholder "Enter discount code"
     - "Apply 10% Discount" button
     - "Continue Without Discount" button
     - Footer text: "Discount codes are provided by our affiliate partners"

4. **Test Dialog Behavior**
   - Verify dialog can be closed by clicking outside or X button
   - Confirm dialog reopens when "Get Instant Access" is clicked again
   - Test keyboard navigation (Tab, Enter, Escape)

### Expected Results

- ✅ Discount dialog appears immediately when purchase button is clicked
- ✅ Dialog has proper styling and accessibility features
- ✅ Both discount and skip options are clearly presented
- ✅ Dialog behavior is consistent and user-friendly
- ✅ No direct redirect to Stripe checkout (dialog intercepts the flow)

### Validation Steps

1. **Visual Verification**
   - Dialog appears centered on screen
   - Backdrop overlay is visible
   - Text is readable and properly formatted

2. **Functional Verification**
   - Dialog can be opened and closed multiple times
   - Input field accepts text input
   - Buttons are clickable and responsive

### Edge Cases to Test

1. **Multiple Dialog Opens**
   - Click purchase button multiple times rapidly
   - Should only show one dialog instance

2. **Browser Navigation**
   - Open dialog, then use browser back button
   - Dialog should close properly

3. **Responsive Design**
   - Test on mobile viewport
   - Dialog should be properly sized and accessible

### Related Components

- Component: `DiscountDialog` (`/src/components/discount-dialog.tsx`)
- Route: Purchase page (`/src/routes/purchase.tsx`)
- Store: `DiscountStore` (`/src/stores/discount-store.ts`)