# Test Scenario: REQ-AF-049 - Affiliate Code Discount Entry

## Requirement
**REQ-AF-049**: Allow users to enter affiliate codes to receive 10% discount

## Test Scenario

### Prerequisites
- Application is running locally (`npm run dev`)
- Test affiliate exists in database with active status
- Test user account exists and is authenticated
- `STRIPE_DISCOUNT_COUPON_ID` environment variable is configured
- 10% discount coupon exists in Stripe dashboard

### Test Setup
```sql
-- Create test affiliate if not exists
INSERT INTO app_affiliate (userId, affiliateCode, paymentLink, commissionRate, isActive)
VALUES (999, 'TEST1234', 'https://paypal.me/testuser', 30, true);
```

### Test Steps

1. **Access Discount Dialog**
   - Navigate to `http://localhost:3000/purchase`
   - Click "Get Instant Access" button
   - Verify discount dialog opens

2. **Enter Valid Affiliate Code**
   - Type "TEST1234" in the discount code input field
   - Verify input accepts the code without errors
   - Confirm no immediate validation errors appear

3. **Apply Discount Code**
   - Click "Apply 10% Discount" button
   - Verify button shows "Validating..." state during processing
   - Wait for validation to complete

4. **Verify Successful Application**
   - Confirm button shows "Applied!" with checkmark icon
   - Verify dialog closes automatically after successful validation
   - Ensure redirect to Stripe checkout occurs

5. **Verify Stripe Integration**
   - Check Stripe checkout session for:
     - Discount coupon applied (10% off)
     - Original price shown with strikethrough
     - Discounted price displayed
     - Affiliate code in session metadata

### Expected Results

- ✅ Valid affiliate codes are accepted and validated
- ✅ 10% discount is applied in Stripe checkout
- ✅ User sees reduced price in checkout session
- ✅ Affiliate code is stored in Stripe metadata for tracking
- ✅ UI provides clear feedback during validation process

### Validation Steps

1. **Code Validation**
   - Network tab shows successful API call to `validateAffiliateCodeFn`
   - Response indicates `{ valid: true }`

2. **Stripe Session**
   - Checkout session includes discount object
   - Metadata contains both affiliate and discount codes
   - Final price reflects 10% reduction

3. **DiscountStore State**
   - Memory store contains the applied code
   - Code persists during checkout session

### Edge Cases to Test

1. **Invalid Affiliate Code**
   - Enter "INVALID123"
   - Should show error: "Invalid discount code. Please check and try again."
   - No discount should be applied

2. **Empty Code Submission**
   - Click "Apply 10% Discount" with empty input
   - Should show error: "Please enter a discount code"

3. **Network Error**
   - Simulate network failure during validation
   - Should show error: "Failed to validate discount code. Please try again."

4. **Inactive Affiliate Code**
   ```sql
   -- Deactivate test affiliate
   UPDATE app_affiliate SET isActive = false WHERE affiliateCode = 'TEST1234';
   ```
   - Should be treated as invalid code

### Performance Tests

1. **Validation Speed**
   - Code validation should complete within 2 seconds
   - UI should remain responsive during validation

2. **Multiple Validations**
   - Try different codes in sequence
   - Each validation should work independently

### Cleanup
```sql
-- Remove test affiliate after testing
DELETE FROM app_affiliate WHERE affiliateCode = 'TEST1234';
```

### Related Files
- Component: `DiscountDialog` (`/src/components/discount-dialog.tsx`)
- Validation: `validateAffiliateCodeFn` (`/src/fn/affiliates.ts`)
- Store: `DiscountStore` (`/src/stores/discount-store.ts`)
- Environment: `STRIPE_DISCOUNT_COUPON_ID` in `.env`