insert into users (id, email, role)
values
  ('00000000-0000-0000-0000-000000000001', 'ops@powderlens.ai', 'ops_admin'),
  ('00000000-0000-0000-0000-000000000002', 'analyst@powderlens.ai', 'analyst')
on conflict (email) do nothing;

insert into wallet_entities (id, address, label, category, conviction)
values
  ('10000000-0000-0000-0000-000000000001', '0x9c9a4a45b0f6b9c4d6e54c8ddf8457085e8f4a11', 'Sticky Yield Cohort 01', 'smart-lp', 92),
  ('10000000-0000-0000-0000-000000000002', '0x5cb912f87af0f4607d3fa10a1d7d00f7d8b96cc2', 'Treasury Pattern Wallet', 'treasury', 76)
on conflict (address) do nothing;

insert into rotation_signals (
  id,
  headline,
  summary,
  confidence,
  severity,
  source_protocol,
  destination_protocol,
  source_asset,
  destination_asset,
  evidence_hash
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Smart LP cohort rotated from mETH/MNT into cmETH/USDe liquidity',
    'A cluster of yield-focused wallets exited directional mETH exposure and re-entered via cmETH/USDe ranges, suggesting a lower-volatility yield posture.',
    87,
    'high',
    'Merchant Moe',
    'Merchant Moe',
    'mETH',
    'cmETH',
    '0xaaa111'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Treasury-style wallets are increasing USDY exposure after USDe outflows',
    'Wallets tagged as low-turnover allocators are moving stable liquidity from USDe-linked pools into USDY accumulation paths.',
    81,
    'medium',
    'Agni Finance',
    'Ondo route',
    'USDe',
    'USDY',
    '0xbbb222'
  )
on conflict (id) do nothing;

insert into signal_evidence (id, signal_id, evidence_type, title, body)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'wallet-cluster',
    '5-wallet LP cohort overlap',
    'Five correlated LP addresses exited mETH/MNT within 14 minutes and rebuilt into cmETH/USDe with similar range width.'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'yield-shift',
    'Defensive yield repositioning',
    'The cohort reduced directional MNT beta while preserving yield exposure through cmETH and stable routing.'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    'treasury-pattern',
    'Low-turnover wallet behavior',
    'Observed addresses historically rotate capital only during mandate or yield-thesis changes and maintain longer holding periods.'
  )
on conflict (id) do nothing;

insert into starter_workflows (id, title, summary, cta, thesis, signal_id)
values
  (
    '50000000-0000-0000-0000-000000000001',
    'Promote the cmETH rotation thesis',
    'Take the highest-conviction capital move on the board and open a ready-to-publish operator thesis for Mantle judges and traders.',
    'Use this thesis',
    'Sticky yield wallets are reducing directional beta and rebuilding through cmETH/USDe. The move looks like defensive capital preservation, not a full risk-off exit, which supports a follow-on watch on low-volatility yield routes.',
    '20000000-0000-0000-0000-000000000001'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'Load the treasury allocator watch',
    'Pre-fill a slower-moving treasury thesis focused on USDY accumulation and lower-churn capital.',
    'Load watch note',
    'Treasury-style wallets are behaving like slow, mandate-driven allocators. The USDY increase should be treated as a durable reweighting signal and not a short-term incentive chase.',
    '20000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into alert_rules (id, user_id, channel, condition, is_enabled)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'telegram',
    'Fire when confidence rises above 85 and cmETH rotation accelerates.',
    true
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'discord',
    'Notify when treasury-style wallets increase USDY accumulation.',
    true
  )
on conflict (id) do nothing;

insert into audit_logs (id, actor_email, action, target_type, target_id, reason)
values
  (
    '40000000-0000-0000-0000-000000000001',
    'ops@powderlens.ai',
    'seeded_dataset',
    'system',
    'powderlens',
    'Initial reference implementation bootstrap'
  )
on conflict (id) do nothing;
