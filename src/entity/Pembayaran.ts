import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Rumah } from "./Rumah";

@Entity()
export class Pembayaran {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Rumah, (rumah) => rumah.pembayaran)
  @JoinColumn({ name: "id_rumah" })
  rumah: Rumah;

  @Column()
  bulan: string;

  @Column({ default: 0 })
  satpam: number;

  @Column({ default: 0 })
  kebersihan: number;

  @Column({ default: 0 })
  jumlah: number;

  @Column()
  status: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;
}
