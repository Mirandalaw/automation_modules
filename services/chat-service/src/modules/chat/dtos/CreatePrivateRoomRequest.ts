export class CreatePrivateRoomRequest {
  // 구매자 ID
  public readonly buyerId: number;

  // 판매자 ID
  public readonly sellerId: number;

  // 거래 품목 ID
  public readonly itemId: number;

  constructor(buyerId: number, sellerId: number, itemId: number) {
    this.buyerId = buyerId;
    this.sellerId = sellerId;
    this.itemId = itemId;
  }
}