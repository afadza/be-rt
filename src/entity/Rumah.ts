import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Pembayaran } from "./Pembayaran";

@Entity()
export class Rumah {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: 0 })
  nomor_rumah: number;

  @Column({ default: "Kosong" })
  status: "Tetap" | "Sementara" | "Kosong";

  @Column({ nullable: true })
  pemilik: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;
  
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @OneToMany(() => Pembayaran, pembayaran => pembayaran.rumah)
  pembayaran: Pembayaran[];
}
