import { Separator } from '@workspace/ui/components/Separator'

export function Footer() {
    return (
        <footer className="bg-muted/20 text-muted-foreground mt-20 border-t text-sm">
            <div className="container mx-auto space-y-10 px-6 py-12">
                {/* Top section */}
                <div className="space-y-4">
                    <img src="/Logo.png" alt="InnEdu Logo" className="h-8 object-contain" />
                    <p className="max-w-2xl text-xs leading-relaxed">
                        Chủ sở hữu: CÔNG TY TNHH TƯ VẤN VÀ PHÁT TRIỂN GIÁO DỤC INNEDU
                        <br />
                        Mã số thuế: 0311993505 do Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh cấp ngày 13/12/2017.
                        <br />
                        Trụ sở: 26 Đường 37, KDC Tân Quy Đông, Phường Tân Phong, Quận 7, Thành phố Hồ Chí Minh, Việt Nam
                        <br />
                        Hotline: <span className="text-foreground">0918 250 667</span>
                        <br />
                        Email:{' '}
                        <a href="mailto:info@inn.edu.vn" className="text-foreground hover:underline">
                            info@inn.edu.vn
                        </a>
                    </p>
                </div>

                {/* Middle section */}
                <div className="space-y-2">
                    <h2 className="text-foreground text-lg font-semibold">
                        Dự Án STEAM - Phát triển tư duy và kỹ năng giải quyết vấn đề
                    </h2>
                </div>

                {/* Links grid */}
                <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
                    {/* Column 1 */}
                    <div>
                        <h3 className="text-foreground mb-2 font-semibold">Cộng đồng</h3>
                        <ul className="space-y-1">
                            <li>
                                <a href="#" className="hover:underline">
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Tiktok
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Youtube
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h3 className="text-foreground mb-2 font-semibold">InnEdu</h3>
                        <ul className="space-y-1">
                            <li>
                                <a href="#" className="hover:underline">
                                    Giới thiệu InnEdu
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Cơ hội nghề nghiệp
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Hướng dẫn thanh toán
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Hợp tác cùng InnEdu
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h3 className="text-foreground mb-2 font-semibold">Phòng bán hàng</h3>
                        <ul className="space-y-1">
                            <li>
                                <a href="mailto:sale@innedu.org" className="hover:underline">
                                    sale@innedu.org
                                </a>
                            </li>
                            <li>0918 250 667</li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Bottom row */}
                <div className="flex flex-col items-center justify-between gap-2 text-xs md:flex-row">
                    <p>Copyright © 2025. All Rights Reserved by InnEdu</p>
                    <div className="flex gap-3">
                        <a href="#" className="hover:underline">
                            Chính sách bảo mật
                        </a>
                        <span>|</span>
                        <a href="#" className="hover:underline">
                            Điều khoản dịch vụ
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
