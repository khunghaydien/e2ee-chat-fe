 "use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Input, Typography } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { PrivateKeyStorage } from "@/libs/ultils/privateKeyStorage";
import { importPrivateKeyFromJwk } from "@/libs/e2ee/ecdh-keys";

interface AuthGuardProps {
    children: ReactNode;
    redirectTo?: string;
}

export const AuthGuard = ({ children, redirectTo = "/sign-in" }: AuthGuardProps) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [hasCheckedPrivateKey, setHasCheckedPrivateKey] = useState(false);
    const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false);
    const [privateKeyInput, setPrivateKeyInput] = useState("");
    const [privateKeyError, setPrivateKeyError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            PrivateKeyStorage.clear();
            router.push(redirectTo);
        }
    }, [isLoading, isAuthenticated, redirectTo, router]);

    useEffect(() => {
        if (!isLoading && isAuthenticated && !hasCheckedPrivateKey) {
            const existing = PrivateKeyStorage.getPrivateKeyJwk();
            if (!existing) {
                setIsPrivateKeyModalOpen(true);
            }
            setHasCheckedPrivateKey(true);
        }
    }, [isLoading, isAuthenticated, hasCheckedPrivateKey]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handler = () => {
            setPrivateKeyInput("");
            setPrivateKeyError(null);
            setIsPrivateKeyModalOpen(true);
        };
        window.addEventListener("require-private-key", handler);
        return () => {
            window.removeEventListener("require-private-key", handler);
        };
    }, []);

    const handleConfirmPrivateKey = async () => {
        const raw = privateKeyInput.trim();
        if (!raw) {
            setPrivateKeyError("Private key is required");
            return;
        }
        try {
            await importPrivateKeyFromJwk(raw);
        } catch (err) {
            if (err instanceof Error && err.message) {
                setPrivateKeyError(err.message);
            } else {
                setPrivateKeyError("Invalid private key (JWK)");
            }
            return;
        }
        PrivateKeyStorage.setPrivateKeyJwk(raw);
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("private-key-updated"));
        }
        setIsPrivateKeyModalOpen(false);
        setPrivateKeyError(null);
    };

    const handleCancelPrivateKey = () => {
        setIsPrivateKeyModalOpen(false);
    };

    if (isLoading || !hasCheckedPrivateKey) {
        return null;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {children}
            <Modal
                open={isPrivateKeyModalOpen}
                onOk={handleConfirmPrivateKey}
                onCancel={handleCancelPrivateKey}
                okText="Save private key"
                cancelText="Cancel"
                maskClosable={false}
                closable={false}
                title="Enter your private key"
            >
                <Typography.Paragraph type="secondary">
                    Paste your private key (JWK) to decrypt your messages. It will be stored in your browser's local storage.
                </Typography.Paragraph>
                <Input.TextArea
                    value={privateKeyInput}
                    onChange={(e) => {
                        setPrivateKeyInput(e.target.value);
                        setPrivateKeyError(null);
                    }}
                    autoSize={{ minRows: 4, maxRows: 8 }}
                    placeholder="Paste your private key JWK here"
                />
                {privateKeyError && (
                    <Typography.Paragraph type="danger" style={{ marginTop: 8 }}>
                        {privateKeyError}
                    </Typography.Paragraph>
                )}
            </Modal>
        </>
    );
};

