# buy_label_r1 — Buy button wording

**Layer:** checkout_modal  
**Started:** 2026-11-17  
**Decision rule:** no earlier than 300 price viewers per arm

## Variants

| Variant | Label |
|---------|-------|
| A (control) | Comprar · {price} |
| B | Imprimir mi pieza · {price} |

Both show the same price. The from-variant ("desde {price}") mirrors the same difference before fulfillment is selected.

## Primary metric

`buy_clicked` per unique visitor who had a price on screen (i.e., who fired `pricing_resolved` with a bundle).

## Secondary metric

`order_paid_server` — server-side confirmation that the payment completed.

## Decision rule

No decision before **300 price viewers per arm**. If neither variant reaches significance by day 60, ship the control (A).

A win for B requires p < 0.05 on `buy_clicked` rate with no negative signal on `order_paid_server`.
