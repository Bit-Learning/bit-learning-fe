import React from "react";
import styles from "../GameDetailPage.module.css";

const Footer = () => {
	return (
		<footer className={styles.footer}>
			<div className={styles.footerGrid}>
				<div>
					<div className={styles.footerLogo}>
						<span
							className="material-icons"
							style={{ color: "#ec1337", fontSize: 22 }}
						>
							keyboard
						</span>
						<span className={styles.footerLogoText}>BIT LEARNING</span>
					</div>
					<p className={styles.footerDesc}>
						Trung tâm đào tạo lập trình hàng đầu Việt Nam với hơn 5 năm kinh
						nghiệm. Chúng tôi cam kết mang đến những khóa học chất lượng cao và
						hỗ trợ học viên 24/7.
					</p>
				</div>
				{/* {[
					{
						heading: "Platform", 
						links: ["All Games", "Tournaments", "Rankings", "Store"],
					},
					{
						heading: "Support",
						links: [
							"Help Center",
							"Privacy Policy",
							"Terms of Service",
							"Cookie Settings",
						],
					},
				].map(({ heading, links }) => (
					<div key={heading}>
						<h4 className={styles.footerHeading}>{heading}</h4>
						<ul className={styles.footerLinks}>
							{links.map((l) => (
								<li key={l}>
									<a href="#" className={styles.footerLink}>
										{l}
									</a>
								</li>
							))}
						</ul>
					</div>
				))} */}
				<div>
					<h4 className={styles.footerHeading}>Follow Us</h4>
					<div className={styles.socialRow}>
						{["facebook", "alternate_email", "movie"].map((icon) => (
							<a key={icon} href="#" className={styles.socialBtn}>
								<span className="material-icons" style={{ fontSize: 20 }}>
									{icon}
								</span>
							</a>
						))}
					</div>
				</div>
			</div>
			<div className={styles.footerCopy}>
				2026 ©Bit Learning. Tất cả quyền được bảo lưu
			</div>
		</footer>
	);
};

export default Footer;
