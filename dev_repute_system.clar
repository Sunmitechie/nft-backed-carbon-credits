(define-map developers { owner: principal } { reputation: uint })
(define-map votes { contract: (string-ascii 64), voter: principal } { voted: bool })

(define-public (register-developer)
    (let ((sender tx-sender))
        (if (map-get developers { owner: sender })
            (err "Developer already registered")
            (begin
                (map-set developers { owner: sender } { reputation: u0 })
                (ok "Registered successfully")))))

(define-public (vote-contract (contract-name (string-ascii 64)) (developer principal))
    (let ((sender tx-sender)
          (vote-key { contract: contract-name, voter: sender }))
        (if (map-get votes vote-key)
            (err "You have already voted on this contract")
            (match (map-get developers { owner: developer })
                developer-data
                (begin
                    (map-set developers { owner: developer } { reputation: (+ (get reputation developer-data) u10) })
                    (map-set votes vote-key { voted: true })
                    (ok "Vote recorded successfully")))
                (err "Developer not found")))))

(define-read-only (get-reputation (developer principal))
    (match (map-get developers { owner: developer })
        developer-data (ok (get reputation developer-data))
        (err "Developer not found")))
