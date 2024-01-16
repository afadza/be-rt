import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Pembayaran } from "../entity/Pembayaran";
import { Rumah } from "../entity/Rumah";
import { format } from "date-fns";

import { Request, Response } from "express";

export default new (class PembayaranServices {
  private readonly pembayaranRepository: Repository<Pembayaran> =
    AppDataSource.getRepository(Pembayaran);

  private readonly rumahRepository: Repository<Rumah> =
    AppDataSource.getRepository(Rumah);

  async find(req: Request, res: Response) {
    try {
      const semua_pembayaran = await this.pembayaranRepository.find({
        relations: ["rumah"],
      });
      return res.status(200).json(semua_pembayaran);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      let { nomor_rumah, bulan, satpam, kebersihan } = req.body;

      const cekRumah = await this.rumahRepository.findOne({
        relations: ["pembayaran"],
        where: { nomor_rumah: nomor_rumah },
      });
      if (cekRumah.status === "Kosong") {
        return res.status(400).json({
          message: "Rumah Tidak Berpenghuni",
        });
      }

      const bulanSudah = cekRumah.pembayaran.find(
        (pembayaran) => pembayaran.bulan === bulan
      );

      if (cekRumah) {
        nomor_rumah = cekRumah.id;
      } else {
        return res.status(400).json({
          message: "Nomor Rumah Tidak Ditemukan",
        });
      }
      if (bulanSudah && bulanSudah.status === "Lunas") {
        return res.status(400).json({
          message: "Pembayaran bulan ini sudah lunas"
        });
      } else if (bulanSudah && bulanSudah.status === "Belum Lunas") {
        return res.status(400).json({
          message: "Kamu sudah bayar bulan ini, tapi masih kurang",
          data: 115000 - bulanSudah.jumlah
        });
      }
      let status = satpam + kebersihan;
      if (status >= 115000) {
        status = "Lunas";
      } else {
        status = "Belum Lunas";
      }

      const pembayaran = this.pembayaranRepository.create({
        rumah: nomor_rumah,
        bulan: bulan,
        status: status,
        satpam: satpam,
        kebersihan: kebersihan,
        jumlah: satpam + kebersihan,
      });

      await this.pembayaranRepository.save(pembayaran);
      return res.status(200).json({
        message: "Pembayaran Berhasil Ditambahkan",
        data: pembayaran,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      let { nomor_rumah, bulan, satpam, kebersihan } = req.body;

      const cekRumah = await this.rumahRepository.findOne({
        relations: ["pembayaran"],
        where: { nomor_rumah: nomor_rumah },
      });

      const pembayaranToUpdate = cekRumah.pembayaran.find(
        (pembayaran) => pembayaran.bulan === bulan
      );

      if (!pembayaranToUpdate) {
        return res.status(400).json({
          message: "Bulan ini kamu belum bayar, harap lakukan pembayaran",
        });
      }

      if(pembayaranToUpdate.status === "Lunas") {
        return res.status(400).json({
          message: "Pembayaran bulan ini sudah lunas"
        });
      }

      pembayaranToUpdate.satpam += satpam;
      pembayaranToUpdate.kebersihan += kebersihan;
      pembayaranToUpdate.jumlah =
        pembayaranToUpdate.satpam + pembayaranToUpdate.kebersihan;

      pembayaranToUpdate.status =
        pembayaranToUpdate.satpam + pembayaranToUpdate.kebersihan >= 115000
          ? "Lunas"
          : "Belum Lunas";

      let kembalian =
        pembayaranToUpdate.satpam + pembayaranToUpdate.kebersihan - 115000;

      await this.pembayaranRepository.save(pembayaranToUpdate);

      return res.status(200).json({
        message: "Pembayaran berhasil diupdate",
        data: {
          pembayaran: pembayaranToUpdate,
          kembalian: kembalian,
        },
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async pembayaranPerBulan(req: Request, res: Response) {
    try {
      const { bulan } = req.query;
  
      let queryBuilder = this.rumahRepository
        .createQueryBuilder("rumah")
        .leftJoinAndSelect(
          "rumah.pembayaran",
          "pembayaran",
          "pembayaran.bulan = :bulan"
        )
        .select([
          "rumah.nomor_rumah as nomor_rumah",
          "rumah.pemilik as pemilik",
          "pembayaran.bulan as bulan",
          "pembayaran.status as status",
          "pembayaran.satpam as satpam",
          "pembayaran.kebersihan as kebersihan",
          "pembayaran.jumlah as jumlah",
          "pembayaran.created_at as created_at",
        ])
        .setParameter("bulan", bulan)
        .where("rumah.pemilik IS NOT NULL")
        .orderBy("rumah.nomor_rumah", "ASC");
  
      if (bulan === "Tahun Ini") {
        queryBuilder = queryBuilder.andWhere("1 = 1");
      }
  
      const allRumahPayments = await queryBuilder.getRawMany();
  
      const rumahPayments = {};
  
      allRumahPayments.forEach((payment) => {
        const nomorRumah = payment.nomor_rumah;
        const totalPembayaran = payment.jumlah || 0;
        const kembalian = totalPembayaran - 115000;
  
        if (!rumahPayments[nomorRumah]) {
          rumahPayments[nomorRumah] = {
            nomor_rumah: nomorRumah,
            pemilik: payment.pemilik,
            payments: [],
          };
        }
  
        rumahPayments[nomorRumah].payments.push({
          bulan: payment.bulan === null ? bulan : payment.bulan,
          satpam: payment.satpam,
          kebersihan: payment.kebersihan,
          total: payment.satpam + payment.kebersihan,
          status: payment.status === null ? "Belum Bayar" : payment.status,
          created_at:
            payment.created_at !== null
              ? format(new Date(payment.created_at), "dd-MM-yyyy")
              : null,
        });
  
        rumahPayments[nomorRumah].kembalian =
          kembalian <= 0 ? "" : kembalian;
      });
  
      const responseArray = Object.values(rumahPayments);
  
      return res.status(200).json(responseArray);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
  

  async pembayaranPerRumah(req: Request, res: Response) {
    try {
      const { nomor_rumah } = req.query;
  
      const nomorRumah = typeof nomor_rumah === 'string' ? parseInt(nomor_rumah, 10) : nomor_rumah;
  
      const bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
  
      const rumah = await this.rumahRepository.findOne({
        relations: ["pembayaran"],
        where: { nomor_rumah: nomorRumah as number },
      });
      
  
      if (!rumah) {
        return res.status(400).json({
          message: "Rumah tidak ditemukan",
        });
      }
  
      const pembayaranPerBulan = bulan.map((namaBulan) => {
        const pembayaranBulanIni = rumah.pembayaran.find(
          (pembayaran) => pembayaran.bulan === namaBulan
        );
  
        return {
          satpam: pembayaranBulanIni ? pembayaranBulanIni.satpam : 0,
          kebersihan: pembayaranBulanIni  ? pembayaranBulanIni.kebersihan : 0,
          jumlah: pembayaranBulanIni ? pembayaranBulanIni.jumlah : 0,
          bulan: namaBulan,
          status: pembayaranBulanIni
            ? pembayaranBulanIni.status
            : "Belum Bayar",
        };
      });
  
      return res.status(200).json({
        nomor_rumah: rumah.nomor_rumah,
        pemilik: rumah.pemilik,
        pembayaran: pembayaranPerBulan,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  }
  
  
  

  async findRekapTotal(req: Request, res: Response) {
    try {
      const bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const semua_rumah = await this.rumahRepository.find({
        relations: ["pembayaran"],
        order: { nomor_rumah: "ASC" },
      });

      const rekapBulanan = bulan.map((namaBulan) => {
        return {
          bulan: namaBulan,
          totalSatpam: 0,
          totalKebersihan: 0,
          total: 0,
        };
      });

      semua_rumah.forEach((rumah) => {
        rumah.pembayaran.forEach((pembayaran) => {
          const indexBulan = bulan.indexOf(pembayaran.bulan);
          if (indexBulan !== -1) {
            rekapBulanan[indexBulan].totalSatpam += pembayaran.satpam;
            rekapBulanan[indexBulan].totalKebersihan += pembayaran.kebersihan;
            rekapBulanan[indexBulan].total += pembayaran.jumlah;
          }
        });
      });

      return res.status(200).json(rekapBulanan);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
})();
