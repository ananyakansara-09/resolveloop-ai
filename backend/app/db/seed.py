from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal, Base, engine
from app.models.order import Order
from app.models.shipping import ShippingEvent
from app.models.policy import Policy
from app.models.case import SupportCase
from app.models.follow_up import FollowUp
from app.core.logging import logger


def seed_database():
    """
    Idempotent seed script for synthetic orders, customers, shipping events, and store policies.
    """
    logger.info("Starting database seeding...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        now = datetime.now(timezone.utc)

        # 1. Seed Store Policies
        policies = [
            {
                "id": "POL-SHIPPING-DELAY",
                "name": "In-Transit Carrier Delay Resolution Policy",
                "policy_type": "shipping_delay",
                "version": "2.1",
                "active": True,
                "policy_content": {
                    "allowed_actions": [
                        "send_customer_email",
                        "create_follow_up",
                        "offer_concession",
                    ],
                    "requires_approval": True,
                    "days_before_refund_eligible": 7,
                    "max_courtesy_discount_percent": 15,
                    "rules_summary": (
                        "When an order encounters an in-transit carrier delay or weather exception, "
                        "the assistant can draft an empathetic proactive notification email and schedule "
                        "a 24-hour follow-up. External email communication requires explicit merchant approval. "
                        "Full refunds are prohibited while packages are actively in transit unless carrier "
                        "confirms loss or delay exceeds 7 business days."
                    ),
                },
            },
            {
                "id": "POL-REFUND-RETURNS",
                "name": "Standard Return & Refund Eligibility Policy",
                "policy_type": "refund",
                "version": "1.4",
                "active": True,
                "policy_content": {
                    "allowed_actions": ["return_authorization", "store_credit"],
                    "requires_approval": True,
                    "return_window_days": 30,
                    "rules_summary": "Refunds require product return delivery verification or confirmed carrier loss.",
                },
            },
            {
                "id": "POL-CUSTOMER-COMMUNICATION",
                "name": "Merchant Outbound Communication Guidelines",
                "policy_type": "customer_communication",
                "version": "3.0",
                "active": True,
                "policy_content": {
                    "allowed_actions": ["draft_customer_email"],
                    "requires_approval": True,
                    "rules_summary": (
                        "All outbound automated emails to customers must be created in a pending state "
                        "and await explicit merchant approval before transmission."
                    ),
                },
            },
        ]

        for p_data in policies:
            existing = db.query(Policy).filter(Policy.id == p_data["id"]).first()
            if existing:
                existing.name = p_data["name"]
                existing.policy_type = p_data["policy_type"]
                existing.version = p_data["version"]
                existing.active = p_data["active"]
                existing.policy_content = p_data["policy_content"]
            else:
                db.add(Policy(**p_data))
        db.commit()

        # 2. Seed Primary Demo Order: KL-1042
        order_kl1042 = db.query(Order).filter(Order.id == "KL-1042").first()
        if not order_kl1042:
            order_kl1042 = Order(
                id="KL-1042",
                customer_name="Sarah Connor",
                customer_email="sarah.c@example.com",
                order_date=now - timedelta(days=3),
                status="delayed",
                total_amount=149.99,
                currency="USD",
            )
            db.add(order_kl1042)
            db.commit()

            # Seed Shipping Events for KL-1042
            events_kl1042 = [
                ShippingEvent(
                    order_id="KL-1042",
                    event_type="picked_up",
                    description="Package received and processed at carrier origin facility",
                    location="Seattle Fulfillment Center, WA",
                    occurred_at=now - timedelta(days=3, hours=2),
                ),
                ShippingEvent(
                    order_id="KL-1042",
                    event_type="in_transit",
                    description="Departed carrier regional sorting hub in transit to destination",
                    location="Portland Sorting Hub, OR",
                    occurred_at=now - timedelta(days=2, hours=6),
                ),
                ShippingEvent(
                    order_id="KL-1042",
                    event_type="carrier_delay",
                    description="Severe winter storm mountain pass closure; carrier transit exception and rerouting in progress. Delay estimated at 24-48 hours.",
                    location="Siskiyou Pass, CA",
                    occurred_at=now - timedelta(days=1, hours=4),
                ),
            ]
            for ev in events_kl1042:
                db.add(ev)
            db.commit()

        # 3. Seed Additional Orders for Dashboard Analytics
        order_kl1043 = db.query(Order).filter(Order.id == "KL-1043").first()
        if not order_kl1043:
            order_kl1043 = Order(
                id="KL-1043",
                customer_name="Marcus Vance",
                customer_email="marcus.v@example.com",
                order_date=now - timedelta(days=5),
                status="delivered",
                total_amount=79.50,
                currency="USD",
            )
            db.add(order_kl1043)
            db.commit()

            db.add(
                ShippingEvent(
                    order_id="KL-1043",
                    event_type="delivered",
                    description="Package delivered to front porch. Signed by resident.",
                    location="Austin, TX",
                    occurred_at=now - timedelta(days=1),
                )
            )
            db.commit()

        order_kl1044 = db.query(Order).filter(Order.id == "KL-1044").first()
        if not order_kl1044:
            order_kl1044 = Order(
                id="KL-1044",
                customer_name="Elena Rostova",
                customer_email="elena.r@example.com",
                order_date=now - timedelta(hours=12),
                status="processing",
                total_amount=299.00,
                currency="USD",
            )
            db.add(order_kl1044)
            db.commit()

        logger.info("Database seeding completed successfully.")
        return True

    except Exception as e:
        logger.error(f"Error during database seed: {e}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
