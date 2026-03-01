import { authAxiosService, publicAxiosService } from "./axios.service";
import { TokenStorage } from "@/libs/ultils/tokenStorage";

// Tuỳ backend của bạn, sửa lại field cho đúng
export interface SignInPayload {
    email: string;
    password: string;
}

export interface SignUpPayload {
    email: string;
    password: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token?: string;
}

export interface AuthResponse<TUser = unknown> extends AuthTokens {
    user?: TUser;
}

class AuthService {
    /**
     * Gọi API sign-in, lưu access_token + refresh_token vào localStorage,
     * trả về toàn bộ response (tokens + user nếu có).
     */
    async signIn<TUser = unknown>(
        payload: SignInPayload
    ): Promise<AuthResponse<TUser>> {
        const { data } = await publicAxiosService.post<AuthResponse<TUser>>(
            "/auth/sign-in",
            payload
        );

        this.persistTokens(data);

        return data;
    }

    /**
     * Gọi API sign-up, lưu tokens nếu backend trả về (tùy thiết kế),
     * trả về response.
     */
    async signUp<TUser = unknown>(
        payload: SignUpPayload
    ): Promise<AuthResponse<TUser>> {
        const { data } = await publicAxiosService.post<AuthResponse<TUser>>(
            "/auth/sign-up",
            payload
        );

        this.persistTokens(data);

        return data;
    }

    /**
     * Dùng refresh_token hiện tại để lấy access_token mới.
     * Axios interceptor trong authAxiosService cũng có cơ chế auto refresh 401,
     * nhưng method này cho phép bạn chủ động refresh nếu cần.
     */
    async refreshToken(): Promise<AuthTokens> {
        const refresh_token = TokenStorage.getRefreshToken();
        if (!refresh_token) {
            throw new Error("No refresh token");
        }

        const { data } = await publicAxiosService.post<AuthTokens>(
            "/auth/refresh-token",
            { refresh_token }
        );

        this.persistTokens(data);

        return data;
    }

    /**
     * Lấy thông tin user hiện tại (nếu đã đăng nhập).
     * Giả sử backend có endpoint /auth/me trả về user.
     */
    async getProfile<TUser = unknown>(): Promise<TUser> {
        const { data } = await authAxiosService.get<TUser>("/auth/me");
        return data;
    }

    /**
     * Xoá tất cả token khỏi localStorage.
     * Gọi khi logout.
     */
    logout() {
        TokenStorage.clearTokens();
    }

    private persistTokens(tokens: Partial<AuthTokens>) {
        if (tokens.access_token) {
            TokenStorage.setAccessToken(tokens.access_token);
        }

        if (tokens.refresh_token) {
            TokenStorage.setRefreshToken(tokens.refresh_token);
        }
    }
}

export const authService = new AuthService();

