import type { OrderDetails } from '../../types/order';
import type { ShippingDetails } from '../../types/shipping';
import type { CaseWithHistory, StorePolicyMatch } from '../../types/case';
import type { FollowUpTask } from '../../types/followUp';
import type { DashboardData } from '../../types/dashboard';

export const INITIAL_ORDERS: Record<string, OrderDetails> = {
  'KL-1042': {
    id: 'KL-1042',
    orderDate: '2026-10-14T14:22:00Z',
    status: 'Delayed',
    totalAmount: 218.5,
    currency: 'USD',
    carrier: 'FedEx Priority',
    trackingNumber: 'TRK-9823412',
    customer: {
      id: 'CUST-8810',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 (555) 392-1084',
      tier: 'VIP',
      ordersCount: 14,
      lifetimeValue: 1840.0,
      csatScore: 4.9,
    },
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      country: 'United States',
    },
    items: [
      {
        id: 'ITEM-1',
        name: 'Apex Thermal Winter Parka - Navy / L',
        sku: 'APX-PRK-NV-L',
        quantity: 1,
        price: 185.0,
      },
      {
        id: 'ITEM-2',
        name: 'Merino Wool Ribbed Beanie - Heather Charcoal',
        sku: 'MRN-BN-HCH',
        quantity: 1,
        price: 33.5,
      },
    ],
  },
  'KL-1089': {
    id: 'KL-1089',
    orderDate: '2026-10-16T11:05:00Z',
    status: 'Delivered',
    totalAmount: 142.0,
    currency: 'USD',
    carrier: 'UPS Ground',
    trackingNumber: '1Z9999999999999999',
    customer: {
      id: 'CUST-7721',
      name: 'Marcus Vance',
      email: 'marcus.vance@example.com',
      phone: '+1 (555) 801-4433',
      tier: 'Standard',
      ordersCount: 3,
      lifetimeValue: 310.0,
      csatScore: 4.6,
    },
    shippingAddress: {
      street: '1204 Pine Creek Rd',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'United States',
    },
    items: [
      {
        id: 'ITEM-3',
        name: 'Trailblazer Waterproof Hiking Boots - Size 10.5',
        sku: 'TBL-HIK-105',
        quantity: 1,
        price: 142.0,
      },
    ],
  },
  'KL-1025': {
    id: 'KL-1025',
    orderDate: '2026-10-12T16:40:00Z',
    status: 'Delivered',
    totalAmount: 289.0,
    currency: 'USD',
    carrier: 'USPS Priority',
    trackingNumber: '9400100000000000000000',
    customer: {
      id: 'CUST-6604',
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 712-9900',
      tier: 'Standard',
      ordersCount: 5,
      lifetimeValue: 620.0,
      csatScore: 4.2,
    },
    shippingAddress: {
      street: '450 Sutter St, Apt 8B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94108',
      country: 'United States',
    },
    items: [
      {
        id: 'ITEM-4',
        name: 'Artisan Ceramic 8-Piece Cookware Set',
        sku: 'ART-CK-08',
        quantity: 1,
        price: 289.0,
      },
    ],
  },
  'KL-0994': {
    id: 'KL-0994',
    orderDate: '2026-10-10T09:15:00Z',
    status: 'Delivered',
    totalAmount: 89.0,
    currency: 'USD',
    carrier: 'DHL Express',
    trackingNumber: 'DHL-48192039',
    customer: {
      id: 'CUST-5512',
      name: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1 (555) 234-5678',
      tier: 'VIP',
      ordersCount: 8,
      lifetimeValue: 980.0,
      csatScore: 5.0,
    },
    shippingAddress: {
      street: '88 King St E',
      city: 'Toronto',
      state: 'ON',
      zip: 'M5C 1G5',
      country: 'Canada',
    },
    items: [
      {
        id: 'ITEM-5',
        name: 'Acoustic Minimalist Desk Lamp',
        sku: 'LMP-DSK-01',
        quantity: 1,
        price: 89.0,
      },
    ],
  },
};

export const INITIAL_SHIPPING: Record<string, ShippingDetails> = {
  'KL-1042': {
    trackingNumber: 'TRK-9823412',
    carrier: 'FedEx Priority',
    serviceLevel: 'FedEx 2-Day Priority Express',
    status: 'Delayed',
    estimatedDelivery: '2026-10-23T18:00:00Z',
    originalEstimatedDelivery: '2026-10-18T18:00:00Z',
    currentLocation: 'Chicago, IL Distribution Hub',
    delayHours: 48,
    events: [
      {
        id: 'EVT-5',
        timestamp: '2026-10-21T08:15:00Z',
        location: 'Chicago, IL (Midwest Hub)',
        status: 'Severe Weather Delay',
        description: 'Blizzard conditions in Midwest corridor halted air ramp transfer. Package secure in climate facility.',
        exception: true,
      },
      {
        id: 'EVT-4',
        timestamp: '2026-10-19T14:40:00Z',
        location: 'Chicago, IL Sorting Facility',
        status: 'Operational Hold',
        description: 'Flight connection rescheduled due to runway ground stop.',
        exception: true,
      },
      {
        id: 'EVT-3',
        timestamp: '2026-10-16T20:10:00Z',
        location: 'Indianapolis, IN Hub',
        status: 'Departed Facility',
        description: 'Container dispatched on express transport line.',
        exception: false,
      },
      {
        id: 'EVT-2',
        timestamp: '2026-10-15T15:30:00Z',
        location: 'Columbus, OH Origin Terminal',
        status: 'Picked Up',
        description: 'Shipment received from merchant warehouse dock.',
        exception: false,
      },
      {
        id: 'EVT-1',
        timestamp: '2026-10-14T16:00:00Z',
        location: 'Columbus, OH',
        status: 'Label Created',
        description: 'Shipping label created and manifests uploaded.',
        exception: false,
      },
    ],
  },
  'KL-1089': {
    trackingNumber: '1Z9999999999999999',
    carrier: 'UPS Ground',
    serviceLevel: 'UPS Standard Ground',
    status: 'Delivered',
    estimatedDelivery: '2026-10-19T14:00:00Z',
    currentLocation: 'Denver, CO Front Porch',
    events: [
      {
        id: 'EVT-10',
        timestamp: '2026-10-19T13:45:00Z',
        location: 'Denver, CO',
        status: 'Delivered',
        description: 'Package left at front door, signed by resident.',
        exception: false,
      },
    ],
  },
};

export const INITIAL_POLICIES: Record<string, StorePolicyMatch> = {
  'KL-1042': {
    policyId: 'POL-SHP-04',
    title: 'Late Delivery On-Time Guarantee (SLA > 48h Delay)',
    category: 'Shipping & Delivery SLA',
    ruleApplied: 'Priority Express orders stalled in transit > 48 hours past guaranteed SLA entitle the customer to a $15 courtesy account credit, proactive personal outreach, and 24h follow-up monitoring.',
    thresholdMet: true,
    recommendedAction: 'Issue $15 Courtesy Credit, send reassurance email with Chicago blizzard explanation, and schedule a 24-hour delivery checkpoint.',
    policyUrl: 'https://policies.example.com/shipping-sla#guarantee',
  },
  'KL-1089': {
    policyId: 'POL-RET-01',
    title: '30-Day Hassle-Free Apparel Exchange',
    category: 'Returns & Exchanges',
    ruleApplied: 'Apparel items can be exchanged for an alternative size within 30 days of delivery with prepaid carrier label.',
    thresholdMet: true,
    recommendedAction: 'Generate prepaid UPS return label for size 10.5 and reserve replacement size 11 in warehouse.',
  },
};

export const INITIAL_CASES: Record<string, CaseWithHistory> = {
  'CASE-2026-1042': {
    id: 'CASE-2026-1042',
    orderId: 'KL-1042',
    customer: INITIAL_ORDERS['KL-1042'].customer,
    issueSummary: 'Order stalled in Chicago weather hub for 48h; customer awaiting winter parka.',
    status: 'awaiting_approval',
    priority: 'high',
    createdAt: '2026-10-21T09:12:00Z',
    updatedAt: '2026-10-21T09:14:30Z',
    actionRequired: true,
    followUpId: 'TASK-1042',
    shipping: INITIAL_SHIPPING['KL-1042'],
    policy: INITIAL_POLICIES['KL-1042'],
    proposedAction: {
      id: 'ACT-1042',
      type: 'courtesy_credit',
      title: 'Issue $15 Courtesy Credit & Send Proactive Delay Update',
      description: 'Authorize $15 customer credit under the Late Delivery Guarantee and dispatch the drafted reassurance email explaining the Chicago weather hold.',
      cost: 15.0,
      status: 'pending',
      evidence: [
        'Carrier status confirms severe weather delay at Chicago distribution hub for 48+ hours',
        'Customer Sarah Jenkins is Tier VIP with 14 lifetime orders and 4.9 CSAT',
        'Store Policy POL-SHP-04 threshold met for $15 credit & proactive outreach',
        'Delivery revised from Oct 18 to Oct 23 without prior notice',
      ],
      customerEmailDraft: `Subject: Update regarding your ResolveLoop order #KL-1042

Dear Sarah,

We are closely monitoring your order #KL-1042 containing the Apex Thermal Winter Parka and Merino Wool Beanie.

We noticed that FedEx is currently experiencing an unexpected weather delay due to a major winter storm at their Chicago distribution hub. Because on-time satisfaction is our top priority, we have automatically applied a $15 courtesy credit to your account for this inconvenience.

Your package is safely secured and FedEx expects transit to resume within 24 hours. You can track real-time updates directly here:
https://track.fedex.com/TRK-9823412

Our team has also scheduled a dedicated check tomorrow morning at 9:00 AM to verify that your parcel has departed Chicago. If there are any further delays, we will reach out immediately.

Warm regards,
UrbanAura Customer Resolution Team`,
    },
    messages: [
      {
        id: 'MSG-1',
        sender: 'user',
        timestamp: '2026-10-21T09:12:00Z',
        content: 'Investigate order KL-1042, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.',
        isVoiceInput: true,
      },
      {
        id: 'MSG-2',
        sender: 'agent',
        timestamp: '2026-10-21T09:12:05Z',
        content: `I've investigated order **KL-1042** for Sarah Jenkins. Here is what I found:

1. **Carrier Status:** The shipment is delayed at the FedEx Chicago hub due to severe winter weather (stalled ~48h past the original Oct 18 delivery SLA).
2. **Policy Evaluation:** Under Store Policy **POL-SHP-04** (Late Delivery Guarantee), Sarah is eligible for a **$15 courtesy account credit** and a proactive reassurance notice.
3. **Proposed Action:** I have prepared a personalized reassurance email and queued the $15 credit for your approval.
4. **Follow-up:** I have scheduled a follow-up checkpoint for tomorrow at 9:00 AM to confirm carrier departure.

Please review the proposed action and draft email on the right panel. Once you approve, I will dispatch the email and credit Sarah's account.`,
      },
    ],
    auditTrail: [
      {
        id: 'AUD-1',
        timestamp: '2026-10-21T09:12:01Z',
        actor: 'user',
        action: 'Case Initialized',
        details: 'Store owner initiated Alexa+ resolution request for order KL-1042.',
      },
      {
        id: 'AUD-2',
        timestamp: '2026-10-21T09:12:02Z',
        actor: 'agent',
        action: 'Tool: lookup_order',
        details: 'Retrieved order details for KL-1042 (Sarah Jenkins, $218.50, 2 items).',
      },
      {
        id: 'AUD-3',
        timestamp: '2026-10-21T09:12:03Z',
        actor: 'agent',
        action: 'Tool: fetch_shipping_events',
        details: 'Retrieved FedEx tracking TRK-9823412. Detected weather exception in Chicago Hub (48h delay).',
      },
      {
        id: 'AUD-4',
        timestamp: '2026-10-21T09:12:04Z',
        actor: 'agent',
        action: 'Tool: check_store_policy',
        details: 'Matched policy POL-SHP-04. Recommended $15 credit & proactive notification.',
      },
      {
        id: 'AUD-5',
        timestamp: '2026-10-21T09:12:05Z',
        actor: 'agent',
        action: 'Tool: schedule_followup',
        details: 'Scheduled task TASK-1042 for 2026-10-22 at 09:00 AM.',
      },
      {
        id: 'AUD-6',
        timestamp: '2026-10-21T09:12:05Z',
        actor: 'agent',
        action: 'Approval Queued',
        details: 'Action ACT-1042 awaiting merchant confirmation before credit execution.',
      },
    ],
  },
  'CASE-2026-1089': {
    id: 'CASE-2026-1089',
    orderId: 'KL-1089',
    customer: INITIAL_ORDERS['KL-1089'].customer,
    issueSummary: 'Customer received wrong shoe size; requesting exchange for size 11.',
    status: 'awaiting_approval',
    priority: 'high',
    createdAt: '2026-10-20T14:10:00Z',
    updatedAt: '2026-10-20T16:30:00Z',
    actionRequired: true,
    shipping: INITIAL_SHIPPING['KL-1089'],
    policy: INITIAL_POLICIES['KL-1089'],
    proposedAction: {
      id: 'ACT-1089',
      type: 'reship',
      title: 'Issue Prepaid Return Label & Reserve Size 11',
      description: 'Send prepaid UPS return label to Marcus Vance and reserve size 11 in warehouse inventory.',
      cost: 0,
      status: 'pending',
      evidence: [
        'Order delivered within 30-day window (delivered Oct 19, 2026)',
        'Item is in eligible unworn exchange condition',
        'Warehouse currently has 6 units of Size 11 in stock',
      ],
      customerEmailDraft: `Subject: Exchange Instructions for your Hiking Boots (Order #KL-1089)

Hi Marcus,

We have reserved a pair of Trailblazer Waterproof Hiking Boots in size 11 for you. Please use the attached prepaid UPS label to send back size 10.5. As soon as carrier scan confirms drop-off, your replacement will ship!

Best,
UrbanAura Support`,
    },
    messages: [
      {
        id: 'MSG-101',
        sender: 'user',
        timestamp: '2026-10-20T14:10:00Z',
        content: 'Check order KL-1089 exchange eligibility and prepare instructions.',
      },
      {
        id: 'MSG-102',
        sender: 'agent',
        timestamp: '2026-10-20T14:10:04Z',
        content: 'Order KL-1089 is eligible for a complimentary size exchange under policy POL-RET-01. I have reserved size 11 and drafted return instructions awaiting your approval.',
      },
    ],
    auditTrail: [
      {
        id: 'AUD-101',
        timestamp: '2026-10-20T14:10:00Z',
        actor: 'user',
        action: 'Case Created',
        details: 'Exchange request initiated.',
      },
      {
        id: 'AUD-102',
        timestamp: '2026-10-20T14:10:04Z',
        actor: 'agent',
        action: 'Policy Evaluated',
        details: 'Approved for complimentary exchange.',
      },
    ],
  },
  'CASE-2026-1025': {
    id: 'CASE-2026-1025',
    orderId: 'KL-1025',
    customer: INITIAL_ORDERS['KL-1025'].customer,
    issueSummary: 'Customer reported cracked lid on Cookware set upon delivery.',
    status: 'investigating',
    priority: 'urgent',
    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-20T11:20:00Z',
    actionRequired: false,
    messages: [
      {
        id: 'MSG-201',
        sender: 'user',
        timestamp: '2026-10-20T08:00:00Z',
        content: 'Review damaged package inquiry for order KL-1025.',
      },
    ],
    auditTrail: [
      {
        id: 'AUD-201',
        timestamp: '2026-10-20T08:00:00Z',
        actor: 'user',
        action: 'Case Created',
        details: 'Damage claim lodged by customer Elena Rostova.',
      },
    ],
  },
  'CASE-2026-0994': {
    id: 'CASE-2026-0994',
    orderId: 'KL-0994',
    customer: INITIAL_ORDERS['KL-0994'].customer,
    issueSummary: 'Address correction to Toronto suite number prior to delivery.',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-18T12:00:00Z',
    actionRequired: false,
    messages: [
      {
        id: 'MSG-301',
        sender: 'user',
        timestamp: '2026-10-18T10:00:00Z',
        content: 'Update address for KL-0994 with carrier DHL.',
      },
      {
        id: 'MSG-302',
        sender: 'agent',
        timestamp: '2026-10-18T10:02:00Z',
        content: 'DHL package address successfully updated to Suite 402. Delivery completed smoothly.',
      },
    ],
    auditTrail: [
      {
        id: 'AUD-301',
        timestamp: '2026-10-18T12:00:00Z',
        actor: 'agent',
        action: 'Case Resolved',
        details: 'Carrier intercepted and parcel delivered.',
      },
    ],
  },
};

export const INITIAL_FOLLOW_UPS: FollowUpTask[] = [
  {
    id: 'TASK-1042',
    caseId: 'CASE-2026-1042',
    orderId: 'KL-1042',
    customerName: 'Sarah Jenkins',
    description: 'Check FedEx tracking for weather clearance and package departure from Chicago Hub; notify customer if delayed past Oct 23.',
    dueDate: '2026-10-22T09:00:00Z',
    status: 'pending',
    priority: 'high',
    assignedTo: 'ResolveLoop AI Agent',
    createdAt: '2026-10-21T09:12:05Z',
    isOverdue: false,
  },
  {
    id: 'TASK-1089',
    caseId: 'CASE-2026-1089',
    orderId: 'KL-1089',
    customerName: 'Marcus Vance',
    description: 'Verify receipt of returned boots at warehouse dock before releasing replacement Size 11.',
    dueDate: '2026-10-21T18:00:00Z',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'Warehouse Dispatch',
    createdAt: '2026-10-20T14:15:00Z',
    isOverdue: false,
  },
  {
    id: 'TASK-1025',
    caseId: 'CASE-2026-1025',
    orderId: 'KL-1025',
    customerName: 'Elena Rostova',
    description: 'Carrier damage insurance claim filing with USPS for cracked ceramic cookware.',
    dueDate: '2026-10-19T17:00:00Z', // Past due!
    status: 'pending',
    priority: 'urgent',
    assignedTo: 'Store Operations',
    createdAt: '2026-10-18T11:00:00Z',
    isOverdue: true,
  },
  {
    id: 'TASK-0994',
    caseId: 'CASE-2026-0994',
    orderId: 'KL-0994',
    customerName: 'David Chen',
    description: 'Confirm delivery satisfaction with VIP customer David Chen after address redirect.',
    dueDate: '2026-10-19T10:00:00Z',
    status: 'completed',
    priority: 'low',
    assignedTo: 'ResolveLoop AI Agent',
    createdAt: '2026-10-18T10:05:00Z',
    completedAt: '2026-10-18T14:20:00Z',
    isOverdue: false,
  },
];

export const INITIAL_DASHBOARD: DashboardData = {
  stats: {
    totalCases: 28,
    openCases: 6,
    awaitingApproval: 2,
    resolvedCases: 20,
    followUpsDue: 3,
  },
  recentCases: Object.values(INITIAL_CASES).map(c => ({
    id: c.id,
    orderId: c.orderId,
    customer: c.customer,
    issueSummary: c.issueSummary,
    status: c.status,
    priority: c.priority,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    actionRequired: c.actionRequired,
  })),
  systemHealth: {
    status: 'operational',
    alexaSimulation: 'connected',
    carrierApi: 'simulated',
    emailService: 'simulated',
    storeSync: 'synced',
    lastPing: new Date().toISOString(),
  },
};
