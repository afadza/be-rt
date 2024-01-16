import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Rumah } from "../entity/Rumah";
import { Pembayaran } from "../entity/Pembayaran";

import { Request, Response } from "express";
import { format } from "date-fns";

export default new (class RumahServices {
  private readonly rumahRepository: Repository<Rumah> =
    AppDataSource.getRepository(Rumah);
  private readonly pembayaranRepository: Repository<Pembayaran> =
    AppDataSource.getRepository(Pembayaran);

  async find(req: Request, res: Response) {
    try {
      const semua_rumah = await this.rumahRepository.find({
        relations: ["pembayaran"],
        order: { nomor_rumah: "ASC" },
      });

      const update_rumah = semua_rumah.map((rumah) => ({
        ...rumah,
        updated_at: format(new Date(rumah.updated_at), "dd-MMMM-yyyy"),
      }));

      return res.status(200).json(update_rumah);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = {
        nomor_rumah: req.body.nomor_rumah,
        status: req.body.status,
        pemilik: req.body.pemilik,
      };
      if (data.nomor_rumah == 0) {
        return res.status(400).json({
          message: "Nomor Rumah Tidak Boleh Kosong",
        });
      }

      const semua_rumah = await this.rumahRepository.find();
      const include = semua_rumah.find(
        (rumah) => rumah.nomor_rumah === data.nomor_rumah
      );
      if (include) {
        return res.status(400).json({
          message: "Nomor Rumah Sudah Ada, Silahkan Gunakan Nomor Rumah Lain",
        });
      }

      const rumah = this.rumahRepository.create(data);
      await this.rumahRepository.save(rumah);
      return res.status(200).json({
        message: "Rumah Berhasil Ditambahkan",
        data: rumah,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const nomor_rumah = req.body.nomor_rumah;

      const rumahToUpdate = await this.rumahRepository.findOne({
        where: { nomor_rumah: nomor_rumah },
      });

      if (!rumahToUpdate) {
        return res.status(400).json({
          message: "Nomor Rumah Tidak Ditemukan",
        });
      }

      if (req.body.status) {
        rumahToUpdate.status = req.body.status;
      }

      if (req.body.pemilik) {
        rumahToUpdate.pemilik = req.body.pemilik;
      }

      if (req.body.status === "Kosong") {
        rumahToUpdate.pemilik = null;
      }

      if (req.body.status !== "Kosong" && req.body.pemilik === "") {
        return res.status(400).json({
          message: "Pemilik Tidak Boleh Kosong",
        });
      }
      await this.rumahRepository.save(rumahToUpdate);

      return res.status(200).json({
        message: "Rumah Berhasil Diperbarui",
        data: rumahToUpdate,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { nomor_rumah } = req.body;

      const rumahToDelete = await this.rumahRepository.findOne({
        relations: ["pembayaran"],
        where: { nomor_rumah: nomor_rumah },
      });

      if (!rumahToDelete) {
        return res.status(404).json({
          message: "Nomor Rumah Tidak Ditemukan",
        });
      }

      const pembayaranToDelete = rumahToDelete.pembayaran;

      await this.pembayaranRepository.remove(pembayaranToDelete);

      await this.rumahRepository.remove(rumahToDelete);

      return res.status(200).json({
        message: "Rumah Berhasil Dihapus",
        data: rumahToDelete,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    }
  }
})();
