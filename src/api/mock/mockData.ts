import type { OrderDetails } from '../../types/order';
import type { ShippingDetails } from '../../types/shipping';
import type { CaseWithHistory, StorePolicyMatch } from '../../types/case';
import type { FollowUpTask } from '../../types/followUp';
import type { DashboardData } from '../../types/dashboard';

export const INITIAL_ORDERS: Record<string, OrderDetails> = {
  'KL-1042': {
    id: 'KL-1042',
    orderDate: '2026-10-18T11:11:19.043676',
    status: 'Delayed',
    totalAmount: 149.99,
    currency: 'USD',
    carrier: 'FedEx Priority',
    trackingNumber: 'TRK-KL-1042',
    customer: {
      id: 'CUST-1042',
      name: 'Sarah Connor',
      email: 'sarah.c@example.com',
      phone: '+1 (555) 392-1084',
      tier: 'VIP',
      ordersCount: 1,
      lifetimeValue: 149.99,
      csatScore: 4.9,
    },
    shippingAddress: {
      street: 'Destination via Siskiyou Pass, CA Hub',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      country: 'United States',
    },
    items: [
      {
        id: 'ITEM-1',
        name: 'Order #KL-1042 Package',
        sku: 'KL-1042',
        quantity: 1,
        price: 149.99,
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
    trackingNumber: 'TRK-KL-1042',
    carrier: 'FedEx Priority',
    serviceLevel: 'Priority Air Transit',
    status: 'Delayed',
    estimatedDelivery: '2026-10-24T06:48:22Z',
    originalEstimatedDelivery: '2026-10-21T11:11:19Z',
    currentLocation: 'Siskiyou Pass, CA',
    delayHours: 48,
    events: [
      {
        id: '88018a62-f7f9-493d-b7b2-6d77ab6a64dd',
        timestamp: '2026-10-20T07:11:19.043676',
        location: 'Siskiyou Pass, CA',
        status: 'Carrier Transit Exception',
        description: 'Severe winter storm mountain pass closure; carrier transit exception and rerouting in progress. Delay estimated at 24-48 hours.',
        exception: true,
      },
      {
        id: '572c22a0-bce1-4980-90d4-c005615fd947',
        timestamp: '2026-10-19T05:11:19.043676',
        location: 'Portland Sorting Hub, OR',
        status: 'In Transit',
        description: 'Departed carrier regional sorting hub in transit to destination',
        exception: false,
      },
      {
        id: '046d42e7-397e-4718-a00c-7077ff9c627d',
        timestamp: '2026-10-18T09:11:19.043676',
        location: 'Seattle Fulfillment Center, WA',
        status: 'Picked Up',
        description: 'Package received and processed at carrier origin facility',
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
  'CASE-4D6142FD': {
    id: 'CASE-4D6142FD',
    orderId: 'KL-1042',
    customer: INITIAL_ORDERS['KL-1042'].customer,
    order: INITIAL_ORDERS['KL-1042'],
    issueSummary: 'Investigate order KL-1042, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.',
    status: 'awaiting_approval',
    priority: 'medium',
    createdAt: '2026-10-23T06:48:22Z',
    updatedAt: '2026-10-23T06:48:22Z',
    actionRequired: true,
    followUpId: 'FOL-875A22F0',
    followUpDescription: 'Verify carrier transit updates for order KL-1042 and ensure delivery resolution within 24 hours.',
    followUpDueAt: '2026-10-24T06:48:22.705240',
    followUps: [
      {
        id: 'FOL-875A22F0',
        case_id: 'CASE-4D6142FD',
        description: 'Verify carrier transit updates for order KL-1042 and ensure delivery resolution within 24 hours.',
        due_at: '2026-10-24T06:48:22.705240',
        status: 'pending',
        created_at: '2026-10-23T06:48:22',
        completed_at: null,
      },
    ],
    shipping: INITIAL_SHIPPING['KL-1042'],
    policy: {
      policyId: 'POL-SHIPPING-DELAY',
      title: 'In-Transit Carrier Delay Resolution Policy',
      category: 'shipping_sla',
      ruleApplied: 'Order KL-1042 has documented transit delay. Under Policy POL-SHIPPING-DELAY (In-Transit Carrier Delay Resolution Policy), proactive explanation and apology email is eligible, but requires explicit merchant approval before transmission.',
      thresholdMet: true,
      recommendedAction: 'send_customer_email, create_follow_up, offer_concession',
    },
    proposedAction: {
      id: 'ACT-3518A410',
      type: 'customer_outreach',
      title: 'Update regarding your Order KL-1042: Shipping Status & Resolution',
      description: 'Proactive customer update regarding shipping transit delay. Requires merchant approval prior to transmission.',
      cost: 0,
      status: 'pending',
      evidence: [
        'Order KL-1042 has documented transit delay. Under Policy POL-SHIPPING-DELAY (In-Transit Carrier Delay Resolution Policy), proactive explanation and apology email is eligible, but requires explicit merchant approval before transmission.',
        'External customer communication and financial concessions require merchant approval before execution.',
        'Notify customer of carrier weather delay and provide revised delivery expectation.',
      ],
      customerEmailDraft: `Dear Sarah Connor,

Thank you for reaching out to us. We have investigated the status of your order (KL-1042) with our carrier partners.

Your package encountered an unexpected delay at Siskiyou Pass, CA due to Severe winter storm mountain pass closure; carrier transit exception and rerouting in progress. Delay estimated at 24-48 hours.. The logistics team has rerouted the shipment to prioritize safe transit, and the carrier estimates delivery within the next 24 to 48 hours.

We sincerely apologize for the inconvenience this delay has caused. We are actively monitoring your shipment and will follow up with you tomorrow with the latest tracking status.

If you have any immediate questions, please reply directly to this message.

Warm regards,
Customer Support Team
ResolveLoop AI Store Support`,
    },
    messages: [
      {
        id: 'e6ab7913-0beb-4839-ac4b-877c8ec5f040',
        sender: 'user',
        timestamp: '06:48 AM',
        content: 'Investigate order KL-1042, check the shipping status and store policy, prepare a response for the customer, and schedule a follow-up tomorrow if it is still delayed.',
      },
      {
        id: 'aad4e97c-0001-4d4a-bc4b-2149a84da7b4',
        sender: 'agent',
        timestamp: '06:48 AM',
        content: `I have investigated order **KL-1042** for customer **Sarah Connor**.

### Findings:
- **Order Status:** Delayed ($149.99 USD)
- **Shipping Status:** Carrier transit exception at Siskiyou Pass, CA (Severe winter storm mountain pass closure; carrier transit exception and rerouting in progress. Delay estimated at 24-48 hours.)
- **Policy Evaluation:** Order KL-1042 has documented transit delay. Under Policy POL-SHIPPING-DELAY (In-Transit Carrier Delay Resolution Policy), proactive explanation and apology email is eligible, but requires explicit merchant approval before transmission.

### Actions Prepared:
1. **Customer Email Draft:** Generated empathetic status update explaining the delay and expected delivery window. *(Awaiting your explicit merchant approval before transmission)*
2. **Follow-Up Scheduled:** Automatic verification scheduled for tomorrow to check carrier rerouting progress.

Please review and approve the pending email action below to dispatch the customer notification.`,
      },
    ],
    auditTrail: [
      {
        id: 'AUD-C4292C24',
        timestamp: '2026-10-23T06:48:22Z',
        actor: 'agent',
        action: 'Case Created Via Tool',
        details: 'Shipping transit investigation for order KL-1042',
      },
      {
        id: 'AUD-7D441180',
        timestamp: '2026-10-23T06:48:22Z',
        actor: 'agent',
        action: 'Action Proposed',
        details: 'Subject: Update regarding your Order KL-1042: Shipping Status & Resolution (Recipient: sarah.c@example.com)',
      },
      {
        id: 'AUD-21F68E25',
        timestamp: '2026-10-23T06:48:22Z',
        actor: 'agent',
        action: 'Follow Up Scheduled',
        details: 'Verify carrier transit updates for order KL-1042 and ensure delivery resolution within 24 hours.',
      },
    ],
  },
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
    id: 'FOL-875A22F0',
    caseId: 'CASE-4D6142FD',
    orderId: 'KL-1042',
    customerName: 'Sarah Connor',
    description: 'Verify carrier transit updates for order KL-1042 and ensure delivery resolution within 24 hours.',
    dueDate: '2026-10-24T06:48:22.705240',
    status: 'pending',
    priority: 'high',
    assignedTo: 'ResolveLoop AI Agent',
    createdAt: '2026-10-23T06:48:22',
    isOverdue: false,
  },
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
