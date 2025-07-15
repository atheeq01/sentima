import sqlalchemy.orm as orm
import models



async def get_admin_overview(db: orm.Session):
    total_courses = db.query(models.CourseUnit).count()
    total_reviews = db.query(models.Review).count()
    total_students = db.query(models.User).filter_by(role="student").count()
    total_lecturers = db.query(models.User).filter_by(role="lecturer").count()

    reviews = db.query(models.Review.sentiment).all()
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
    for r in reviews:
        sentiment_counts[r.sentiment] += 1

    total_sentiments = len(reviews)
    system_sentiment = {
        "positive": sentiment_counts["positive"] / total_sentiments if total_sentiments else 0,
        "negative": sentiment_counts["negative"] / total_sentiments if total_sentiments else 0,
        "neutral": sentiment_counts["neutral"] / total_sentiments if total_sentiments else 0,
    }

    return {
        "total_courses": total_courses,
        "total_reviews": total_reviews,
        "total_students": total_students,
        "total_lecturers": total_lecturers,
        "sentiment_distribution": system_sentiment,
    }