(define-non-fungible-token carbon-credit-nft uint)

(define-data-var total-carbon-offset uint 0)

(define-map carbon-offset-data 
  { id: uint } 
  { amount: uint, issuer: principal, status: (buff 10) })

(define-public (mint-carbon-credit (id uint) (amount uint) (issuer principal))
  (begin
    (asserts! (is-eq tx-sender issuer) (err u100))
    (asserts! (> amount u0) (err u101))
    (map-insert carbon-offset-data 
      { id: id }
      { amount: amount, issuer: issuer, status: (buff u"active") })
    (var-set total-carbon-offset (+ (var-get total-carbon-offset) amount))
    (nft-mint? carbon-credit-nft id tx-sender)
    (ok "Carbon credit NFT minted")))

(define-public (transfer-carbon-credit (id uint) (recipient principal))
  (begin
    (nft-transfer? carbon-credit-nft id tx-sender recipient)
    (ok "Carbon credit NFT transferred")))

(define-public (retire-carbon-credit (id uint))
  (let ((credit-data (map-get? carbon-offset-data { id: id })))
    (match credit-data
      value
      (begin
        (asserts! (is-eq tx-sender (get issuer value)) (err u102))
        (map-set carbon-offset-data 
          { id: id } 
          { amount: (get amount value), issuer: (get issuer value), status: (buff u"retired") })
        (ok "Carbon credit NFT retired"))
      (err u103))))
