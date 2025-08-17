class DiscountStore {
  private discountCode: string | null = null;

  setDiscountCode(code: string | null) {
    this.discountCode = code;
  }

  getDiscountCode(): string | null {
    return this.discountCode;
  }

  clearDiscountCode() {
    this.discountCode = null;
  }
}

export const discountStore = new DiscountStore();