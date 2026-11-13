"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Feedback";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useAccount } from "@/context/AccountContext";
import { useToast } from "@/context/ToastContext";
import { pakistanCities } from "@/lib/config/payment";
import type { SavedAddress } from "@/lib/types";
import { uid } from "@/lib/utils";
import {
  hasErrors,
  validateAddress,
  validateCity,
  validateFullName,
  validateMobile,
  validateOptionalEmail,
} from "@/lib/validation";

export default function AccountPage() {
  const { profile, addresses, saveProfile, saveAddresses, ready } = useAccount();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile.fullName);
  const [mobile, setMobile] = useState(profile.mobile);
  const [email, setEmail] = useState(profile.email);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFullName(profile.fullName);
    setMobile(profile.mobile);
    setEmail(profile.email);
  }, [profile]);

  const [addrModal, setAddrModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    fullName: "",
    mobile: "",
    city: "Lahore",
    address: "",
  });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});

  if (!ready) {
    return (
      <div className="container-page py-16">
        <PageLoader label="Loading account…" />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      fullName: validateFullName(fullName),
      mobile: validateMobile(mobile),
      email: validateOptionalEmail(email),
    };
    setProfileErrors(next);
    if (hasErrors(next)) return;
    await saveProfile({ ...profile, fullName: fullName.trim(), mobile: mobile.trim(), email: email.trim() });
    toast.success("Profile updated");
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      fullName: validateFullName(newAddr.fullName),
      mobile: validateMobile(newAddr.mobile),
      city: validateCity(newAddr.city),
      address: validateAddress(newAddr.address),
    };
    setAddrErrors(next);
    if (hasErrors(next)) return;

    const created: SavedAddress = {
      id: uid("addr"),
      label: newAddr.label.trim() || "Address",
      fullName: newAddr.fullName.trim(),
      mobile: newAddr.mobile.trim(),
      city: newAddr.city.trim(),
      address: newAddr.address.trim(),
      isDefault: addresses.length === 0,
    };
    await saveAddresses([...addresses, created]);
    toast.success("Address added");
    setAddrModal(false);
    setNewAddr({ label: "Home", fullName: "", mobile: "", city: "Lahore", address: "" });
  };

  const setDefault = async (id: string) => {
    await saveAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
    toast.success("Default address updated");
  };

  const deleteAddress = async (id: string) => {
    const remaining = addresses.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    await saveAddresses(remaining);
    toast.info("Address removed");
  };

  return (
    <AccountShell title="My Account" description="Manage your profile details and saved delivery addresses.">
      <div className="space-y-6">
        {/* Profile */}
        <form onSubmit={handleSaveProfile} noValidate className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-ink-900">Profile Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={profileErrors.fullName}
            />
            <Input
              label="Mobile Number"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              error={profileErrors.mobile}
            />
            <Input
              label="Email Address"
              optional
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={profileErrors.email}
              wrapperClassName="sm:col-span-2"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Profile</Button>
          </div>
        </form>

        {/* Saved Addresses */}
        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink-900">Saved Delivery Addresses</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNewAddr({ label: "Home", fullName: profile.fullName, mobile: profile.mobile, city: "Lahore", address: "" });
                setAddrErrors({});
                setAddrModal(true);
              }}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-sm text-ink-500">No saved addresses yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {addresses.map((a) => (
                <li
                  key={a.id}
                  className={`rounded-xl border p-4 ${
                    a.isDefault ? "border-brand-400 bg-brand-50/40" : "border-ink-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-600" />
                      <span className="font-semibold text-ink-900">{a.label}</span>
                      {a.isDefault && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!a.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefault(a.id)}
                          title="Set as default"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-amber-600"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAddress(a.id)}
                        title="Delete address"
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink-800">{a.fullName}</p>
                  <p className="text-xs text-ink-500">{a.mobile}</p>
                  <p className="mt-1 text-sm text-ink-600">
                    {a.address}, {a.city}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal open={addrModal} onClose={() => setAddrModal(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Label"
              placeholder="Home, Office…"
              value={newAddr.label}
              onChange={(e) => setNewAddr((a) => ({ ...a, label: e.target.value }))}
            />
            <Select
              label="City"
              required
              value={newAddr.city}
              onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value }))}
              error={addrErrors.city}
            >
              {pakistanCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input
              label="Recipient Name"
              required
              value={newAddr.fullName}
              onChange={(e) => setNewAddr((a) => ({ ...a, fullName: e.target.value }))}
              error={addrErrors.fullName}
            />
            <Input
              label="Mobile Number"
              required
              value={newAddr.mobile}
              onChange={(e) => setNewAddr((a) => ({ ...a, mobile: e.target.value }))}
              error={addrErrors.mobile}
            />
          </div>
          <Textarea
            label="Full Address"
            required
            value={newAddr.address}
            onChange={(e) => setNewAddr((a) => ({ ...a, address: e.target.value }))}
            error={addrErrors.address}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddrModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Address</Button>
          </div>
        </form>
      </Modal>
    </AccountShell>
  );
}

