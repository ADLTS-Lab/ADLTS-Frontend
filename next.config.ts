import type { NextConfig } from "next";
import { networkInterfaces, type NetworkInterfaceInfo } from "node:os";

function isLanIpv4Address(address: NetworkInterfaceInfo | undefined): address is NetworkInterfaceInfo {
  return Boolean(address && address.family === "IPv4" && !address.internal);
}

function getLocalDevOrigins() {
  const configured = process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",") ?? [];
  const localAddresses = Object.values(networkInterfaces())
    .flat()
    .filter(isLanIpv4Address)
    .map((address) => address.address);

  return [...new Set([...configured, ...localAddresses].map((origin) => origin.trim()).filter(Boolean))];
}

const backendOrigin = process.env.BACKEND_ORIGIN?.trim().replace(/\/$/, "");

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalDevOrigins(),
  async rewrites() {
    if (!backendOrigin) return [];

    return [
      {
        source: "/backend/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
