"use client";
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') {
            setLoading(true);
            return;
        }

        setLoading(false);

        if (session) {
            router.push("/homepage");
        }
    }, [session, status, router]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res.error) {
                toast({
                    variant: "destructive",
                    title: 'เกิดข้อผิดพลาด',
                    description: 'อีเมล หรือ รหัสผ่านไม่ถูก',
                    duration: 2000,
                });
                return;
            }

            toast({
                variant: "success",
                title: 'กำลังเข้าสู่ระบบ',
                duration: 2000,
            });

            router.push("/dashboard");

        } catch (error) {
            console.log("Error during sign-in:", error);
            setError("An error occurred during sign-in");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-custom">
            <div className="bg-white px-16 py-8  shadow-md mb-8 form-border">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="flex items-center justify-center w-80">
                            <div className="text-center">
                                <h3 className="text-3xl font-mono">
                                    Login
                                </h3>
                            </div>
                        </div>
                        <div className="w-full ">
                            <label className="block text-gray-700 font-mono">
                                Email
                            </label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 input-border pl-4"
                                placeholder="อีเมล์"
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-gray-700 font-mono">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 input-border pl-4"
                                placeholder="พาสเวิร์ด"
                            />
                        </div>
                        <div className="flex justify-center">
                            <Button type="submit" className="bg-blue-800">Login</Button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </form>
            </div>
        </main>
    );
}