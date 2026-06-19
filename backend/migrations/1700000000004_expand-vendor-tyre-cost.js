/* Closes gap-analysis findings: vendor_master missing MSME/compliance/rate-contract
   fields, and tyre cost-per-km reporting needs per-event cost and odometer-derived
   km tracking plus a scrap value on tyre_master. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('vendor_master', {
    is_msme: { type: 'boolean', notNull: true, default: false },
    service_locations: { type: 'text' },
    oem_association: { type: 'text' },
    rate_contract_valid_from: { type: 'date' },
    rate_contract_valid_to: { type: 'date' },
    sla_terms: { type: 'text' },
    bank_account_no: { type: 'text' },
    bank_ifsc: { type: 'text' },
    approval_status: { type: 'varchar(20)', notNull: true, default: 'Pending' },
    vendor_rating: { type: 'numeric(3,2)' },
  });

  pgm.addColumns('tyre_master', {
    scrap_value: { type: 'numeric(14,2)' },
  });

  pgm.addColumns('tyre_movement', {
    km_at_event: { type: 'decimal(12,1)' },
    event_cost: { type: 'numeric(14,2)' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('tyre_movement', ['km_at_event', 'event_cost']);
  pgm.dropColumns('tyre_master', ['scrap_value']);
  pgm.dropColumns('vendor_master', [
    'is_msme', 'service_locations', 'oem_association', 'rate_contract_valid_from',
    'rate_contract_valid_to', 'sla_terms', 'bank_account_no', 'bank_ifsc',
    'approval_status', 'vendor_rating',
  ]);
};
