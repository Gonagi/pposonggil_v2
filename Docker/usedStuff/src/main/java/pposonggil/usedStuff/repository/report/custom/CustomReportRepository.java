package pposonggil.usedStuff.repository.report.custom;

import pposonggil.usedStuff.domain.Report;

import java.util.List;

public interface CustomReportRepository {
    List<Report> findAllWithMember();
}