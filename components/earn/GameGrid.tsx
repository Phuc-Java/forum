"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Client, Account, Databases, Query } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

// Imports Styles & Config
import { GAME_CONFIG, GameMode } from "./config/constants";
import { AncientButton } from "./ui/AncientButton";
import { SpiritBackground } from "./ui/SpiritBackground";
import { LackSpiritModal } from "./ui/LackSpiritModal";
import { AccessDeniedModal } from "./ui/AccessDeniedModal";
import { UnderDevelopmentModal } from "./ui/UnderDevelopmentModal";
import { ServerRequiredModal } from "./ui/ServerRequiredModal";

// Imports Games
import { MiningGame } from "./games/MiningGame";
import { MemoryGame } from "./games/MemoryGame";
import { DiceGame } from "./games/DiceGame";
import { LuckyWheel } from "./games/LuckyWheel";
import { BeastGame } from "./games/BeastGame";
import { AlchemyGame } from "./games/AlchemyGame";
import { PlinkoGame } from "./games/PlinkoGame";
import { CardDuelGame } from "./games/CardDuelGame";
import { AscensionGame } from "./games/AscensionGame";
import { ElementalGame } from "./games/ElementalGame";
export default function GameGrid() {
  const [balance, setBalance] = useState(0);
  const [activeMode, setActiveMode] = useState<GameMode>("LOBBY");
  const [userId, setUserId] = useState<string | null>(null);
  const [profileDocId, setProfileDocId] = useState<string | null>(null);

  // State lò luyện đan
  const [isCauldronBroken, setIsCauldronBroken] = useState(false);

  // --- STATE MỚI: QUẢN LÝ MODAL THIẾU TIỀN ---
  const [alertState, setAlertState] = useState({
    isOpen: false,
    required: 0,
  });

  // --- STATE CHO MODAL GAME GIẢ ---
  const [accessDeniedModal, setAccessDeniedModal] = useState({
    isOpen: false,
    gameName: "",
  });
  const [developmentModal, setDevelopmentModal] = useState({
    isOpen: false,
    gameName: "",
  });
  const [serverRequiredModal, setServerRequiredModal] = useState({
    isOpen: false,
    gameName: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);
        const account = new Account(client);
        const databases = new Databases(client);

        // Lấy user hiện tại
        const user = await account.get();
        setUserId(user.$id);

        const profileRes = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          "profiles",
          [Query.equal("userId", user.$id)]
        );

        if (profileRes.documents.length > 0) {
          const doc = profileRes.documents[0];
          setBalance(Number(doc.currency) || 0);
          setProfileDocId(doc.$id);
          setIsCauldronBroken(doc.isCauldronBroken || false);
        } else {
          setBalance(10000); // Default cho người mới
        }
      } catch (e) {
        console.error("Appwrite connect fail (Demo Mode)", e);
        setBalance(10000);
      }
    };
    init();
  }, []);

  const syncBalanceToAppwrite = useCallback(
    async (newBalance: number) => {
      if (!userId) return;
      try {
        const client = new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId);
        const databases = new Databases(client);

        // If we already have profile doc id, update directly
        if (profileDocId) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            "profiles",
            profileDocId,
            { currency: String(newBalance) }
          );
          return;
        }

        // Otherwise try to lookup by userId then update
        const res = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          "profiles",
          [Query.equal("userId", userId), Query.limit(1)]
        );
        if (res.documents.length > 0) {
          const doc = res.documents[0];
          setProfileDocId(doc.$id);
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            "profiles",
            doc.$id,
            { currency: String(newBalance) }
          );
        } else {
          // No profile found - skip creating here to avoid schema issues
          console.warn("[APPWRITE]: No profile document found to sync balance");
        }
      } catch (error) {
        console.error("[APPWRITE]: Sync failed", error);
      }
    },
    [userId, profileDocId]
  );

  const handleCost = useCallback(
    (amount: number) => {
      setBalance((prev) => {
        const newVal = prev - amount;
        if (newVal >= 0) syncBalanceToAppwrite(newVal);
        return newVal;
      });
    },
    [syncBalanceToAppwrite]
  );

  const handleReward = useCallback(
    (amount: number) => {
      setBalance((prev) => {
        const newVal = prev + amount;
        syncBalanceToAppwrite(newVal);
        return newVal;
      });
    },
    [syncBalanceToAppwrite]
  );

  const handleRepairSuccess = useCallback(() => {
    setIsCauldronBroken(false);
  }, []);

  // --- HÀM MỚI: XỬ LÝ CHỌN GAME ---
  // Kiểm tra tiền trước khi cho vào
  const handleGameSelect = (
    gameId: string,
    cost: number,
    gameName: string,
    isLocked?: boolean,
    isDevelopment?: boolean,
    needsServer?: boolean
  ) => {
    // Kiểm tra nếu game bị khóa (chưa đủ quyền hạn)
    if (isLocked) {
      setAccessDeniedModal({
        isOpen: true,
        gameName: gameName,
      });
      return;
    }

    // Kiểm tra nếu game cần server
    if (needsServer) {
      setServerRequiredModal({
        isOpen: true,
        gameName: gameName,
      });
      return;
    }

    // Kiểm tra nếu game đang phát triển
    if (isDevelopment) {
      setDevelopmentModal({
        isOpen: true,
        gameName: gameName,
      });
      return;
    }

    // Nếu game có phí vào cửa (hoặc phí chơi tối thiểu) lớn hơn số tiền hiện có
    if (balance < cost) {
      setAlertState({
        isOpen: true,
        required: cost,
      });
      return;
    }
    setActiveMode(gameId as GameMode);
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen p-4 md:p-8 font-sans text-white relative overflow-hidden bg-[#050505]">
      {/* Background đã được tối ưu GPU ở bước trước */}
      <SpiritBackground />
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent)] pointer-events-none z-0"></div>

      {/* --- MODAL CẢNH BÁO --- */}
      <LackSpiritModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
        requiredAmount={alertState.required}
        currentAmount={balance}
        onGoToMine={() => {
          setAlertState((prev) => ({ ...prev, isOpen: false }));
          setActiveMode("MINING");
        }}
      />

      {/* --- MODAL CHƯA ĐỦ QUYỀN HẠN --- */}
      <AccessDeniedModal
        isOpen={accessDeniedModal.isOpen}
        onClose={() => setAccessDeniedModal({ isOpen: false, gameName: "" })}
        gameName={accessDeniedModal.gameName}
      />

      {/* --- MODAL CẦN SERVER --- */}
      <ServerRequiredModal
        isOpen={serverRequiredModal.isOpen}
        onClose={() => setServerRequiredModal({ isOpen: false, gameName: "" })}
        gameName={serverRequiredModal.gameName}
      />

      {/* --- MODAL ĐANG PHÁT TRIỂN --- */}
      <UnderDevelopmentModal
        isOpen={developmentModal.isOpen}
        onClose={() => setDevelopmentModal({ isOpen: false, gameName: "" })}
        gameName={developmentModal.gameName}
      />

      {/* HEADER HUD */}
      <div className="fixed top-20 left-0 right-0 z-50 p-2 md:p-3 flex justify-between items-start pointer-events-none">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          // OPTIMIZATION: will-change-transform cho header bay xuống
          className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-amber-500/30 rounded-full pl-2 pr-6 py-2 flex items-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.2)] will-change-transform"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full flex items-center justify-center border-2 border-amber-200 shadow-inner">
            <span className="text-xl">💎</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
              Linh Thạch
            </span>
            <span className="text-lg font-mono font-bold text-white leading-none">
              {balance.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {activeMode !== "LOBBY" && (
          <div className="pointer-events-auto">
            <AncientButton
              onClick={() => setActiveMode("LOBBY")}
              size="sm"
              variant="ghost"
            >
              ↩ Rời Bàn
            </AncientButton>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="mt-12 relative z-10">
        <AnimatePresence mode="wait">
          {activeMode === "LOBBY" ? (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              // OPTIMIZATION: will-change-transform cho cả grid lobby
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 will-change-transform"
            >
              {Object.values(GAME_CONFIG).map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() =>
                    handleGameSelect(
                      game.id,
                      game.cost,
                      game.name,
                      (game as any).isLocked,
                      (game as any).isDevelopment,
                      (game as any).needsServer
                    )
                  }
                  // OPTIMIZATION: will-change + transform-gpu cho từng thẻ bài để hover siêu mượt
                  className="group relative h-72 cursor-pointer rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] will-change-transform transform-gpu"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-amber-950/30 opacity-60"></div>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                    {/* OPTIMIZATION: scale/rotate icon cũng dùng GPU */}
                    <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 drop-shadow-2xl transform-gpu">
                      {game.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-widest">
                      {game.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 group-hover:text-gray-300 line-clamp-2 px-4 font-serif">
                      {game.desc}
                    </p>
                    <div className="mt-6 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-amber-500/80 group-hover:bg-amber-500/10 group-hover:border-amber-500/30">
                      {game.cost > 0 ? `Cược: ${game.cost}` : "Miễn Phí"}
                    </div>
                  </div>
                  {/* OPTIMIZATION: Hiệu ứng ánh sáng chạy qua dùng transform translate thay vì left/top (đã có trong class gốc) */}
                  <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/5 to-transparent rotate-45 group-hover:translate-x-[50%] group-hover:translate-y-[50%] transition-transform duration-1000 ease-in-out pointer-events-none transform-gpu"></div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="game-arena"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              // OPTIMIZATION: Container game lớn dùng GPU Layer riêng
              className="relative w-full min-h-[700px] bg-[#080808] border border-amber-900/30 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col will-change-transform"
            >
              {/* Giữ nguyên các phần trang trí góc */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-amber-800/50 rounded-tl-[2rem] pointer-events-none z-20"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-amber-800/50 rounded-br-[2rem] pointer-events-none z-20"></div>
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-amber-800/50 rounded-tr-[2rem] pointer-events-none z-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-amber-800/50 rounded-bl-[2rem] pointer-events-none z-20"></div>

              <div className="flex-1 md:p-4 flex items-center justify-center relative z-10">
                {activeMode === "MINING" && (
                  <MiningGame onReward={handleReward} />
                )}
                {activeMode === "MEMORY" && (
                  <MemoryGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
                {activeMode === "DICE" && (
                  <DiceGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
                {activeMode === "WHEEL" && (
                  <LuckyWheel
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
                {activeMode === "BEASTS" && (
                  <BeastGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
                {activeMode === "ALCHEMY" && (
                  <AlchemyGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                    initialBroken={isCauldronBroken}
                    userId={userId}
                    onRepairSuccess={handleRepairSuccess}
                  />
                )}
                {activeMode === "PLINKO" && (
                  <PlinkoGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
                {activeMode === "CARD" && (
                  <CardDuelGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
                {activeMode === "ASCENSION" && (
                  <AscensionGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
                {activeMode === "ELEMENTAL" && (
                  <ElementalGame
                    onPlayCost={handleCost}
                    onReward={handleReward}
                    balance={balance}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
