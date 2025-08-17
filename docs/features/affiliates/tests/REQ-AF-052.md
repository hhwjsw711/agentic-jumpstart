# Test Scenario: REQ-AF-052 - Pre-fill Discount Dialog with URL Parameter

## Requirement
**REQ-AF-052**: Pre-fill discount dialog with affiliate code from URL parameter

## Test Scenario

### Prerequisites
- Application is running locally (`npm run dev`)
- Test affiliate exists in database with active status
- Browser supports URL parameters
- DiscountStore is functioning properly

### Test Setup
```sql
-- Create test affiliate
INSERT INTO app_affiliate (userId, affiliateCode, paymentLink, commissionRate, isActive)
VALUES (995, 'PREFILL1', 'https://paypal.me/prefilltest', 30, true);
```

### Test Steps

1. **Navigate with Affiliate Code Parameter**
   - Open browser and go to `http://localhost:3000/purchase?ref=PREFILL1`
   - Verify page loads correctly
   - Confirm URL parameter is captured

2. **Verify Memory Storage**
   - Check that DiscountStore captures the affiliate code
   - Code should be stored in memory upon page load
   - No browser storage (cookies/localStorage) should be used

3. **Open Discount Dialog**
   - Click "Get Instant Access" button to trigger checkout
   - Verify discount dialog opens

4. **Verify Pre-filled Code**
   - Confirm the discount code input field contains "PREFILL1"
   - Code should be pre-populated without user action
   - Input field should be editable (user can modify if needed)

5. **Test Code Application**
   - Click "Apply 10% Discount" button
   - Verify the pre-filled code is validated successfully
   - Confirm discount is applied and checkout proceeds

### Expected Results

- ✅ URL parameter `?ref=PREFILL1` is captured correctly
- ✅ Affiliate code is stored in DiscountStore memory
- ✅ Discount dialog opens with code pre-filled
- ✅ Pre-filled code can be validated and applied
- ✅ User can edit the pre-filled code if desired
- ✅ No persistent browser storage is used

### Technical Validation

1. **URL Parameter Capture**
   - Verify `useEffect` hook captures `ref` parameter
   - Check `Route.useSearch()` returns the correct value
   - Confirm `discountStore.setDiscountCode(ref)` is called

2. **Memory Storage Verification**
   - DiscountStore contains the affiliate code
   - Code persists during page session
   - Code is cleared when page is refreshed without parameter

3. **Dialog State Management**
   - `initialCode` prop is passed to DiscountDialog
   - `useState` initializes with the stored code
   - Input field displays the code immediately

### Edge Cases to Test

1. **Invalid URL Parameter**
   - Navigate to `http://localhost:3000/purchase?ref=INVALID99`
   - Dialog should still pre-fill with "INVALID99"
   - Validation should fail with appropriate error message

2. **Empty URL Parameter**
   - Navigate to `http://localhost:3000/purchase?ref=`
   - Dialog should open with empty input field
   - No pre-filling should occur

3. **Special Characters in Parameter**
   - Test with URL-encoded characters
   - Navigate to `http://localhost:3000/purchase?ref=TEST%20123`
   - Should handle URL decoding properly

4. **Multiple Parameters**
   - Navigate to `http://localhost:3000/purchase?ref=PREFILL1&utm_source=test`
   - Should capture only the `ref` parameter
   - Other parameters should be ignored

5. **Parameter Override**
   - Navigate with one code: `?ref=FIRST123`
   - Open dialog, clear input, enter different code
   - User input should override URL parameter

6. **Page Refresh**
   - Navigate to `http://localhost:3000/purchase?ref=PREFILL1`
   - Refresh the page
   - Code should be captured again from URL

7. **Navigation Without Parameter**
   - First visit with parameter: `?ref=PREFILL1`
   - Then navigate to `/purchase` without parameter
   - DiscountStore should be cleared

### Browser Compatibility Tests

1. **Different Browsers**
   - Test in Chrome, Firefox, Safari
   - URL parameter handling should be consistent

2. **URL Encoding**
   - Test with encoded characters in affiliate codes
   - Proper decoding should occur

### Performance Tests

1. **Large Parameter Values**
   - Test with very long affiliate codes
   - Should handle gracefully without performance issues

2. **Rapid Navigation**
   - Navigate between pages with different parameters quickly
   - Memory store should update correctly each time

### Security Considerations

1. **XSS Prevention**
   - Test with malicious scripts in URL parameter
   - Should be safely handled without execution

2. **Parameter Injection**
   - Attempt to inject additional parameters
   - Only valid affiliate codes should be processed

### User Experience Tests

1. **Clear User Flow**
   - User clicks affiliate link with ?ref parameter
   - Lands on purchase page
   - Clicks purchase button
   - Sees their code already filled in
   - Can proceed with one click

2. **Error Recovery**
   - If pre-filled code is invalid, user gets clear error
   - User can easily correct the code
   - Validation works for corrected codes

### Cleanup
```sql
-- Remove test affiliate after testing
DELETE FROM app_affiliate WHERE affiliateCode = 'PREFILL1';
```

### Related Components
- Route: Purchase page (`/src/routes/purchase.tsx`)
- Store: `DiscountStore` (`/src/stores/discount-store.ts`)
- Component: `DiscountDialog` (`/src/components/discount-dialog.tsx`)
- Hook: `Route.useSearch()` from TanStack Router

### Code References
```typescript
// In purchase.tsx
const { ref } = Route.useSearch();
useEffect(() => {
  if (ref) {
    discountStore.setDiscountCode(ref);
  }
}, [ref]);

// In DiscountDialog
initialCode={discountStore.getDiscountCode() || ""}
```